import type { User } from "../../../shared/types/domain";
import { browserSessionExclusive } from "./browserSessionLock";
import {
	AccountVerificationError,
	fetchCurrentUser,
	getTokenExpirationTime,
	getSessionExpiryTimerDelay,
	requestPasswordToken,
	requestDccAccessToken,
	redirectToDccLogin,
	type LoginCredentials,
} from "../api/auth.api";

export const SESSION_KEY = "ramitos-session-v1";
const DCC_ATTEMPT_KEY = "ramitos-dcc-attempt";
type SessionRecord = { id: string; token: string | null };
export type SessionIssue =
	| "expired"
	| "denied"
	| "verification"
	| "storage"
	| null;
export type SessionSnapshot = {
	status: "checking" | "anonymous" | "authenticated" | "error";
	user: User | null;
	pending: boolean;
	issue: SessionIssue;
};
export type LoginOutcome =
	| { status: "accepted" | "cancelled" }
	| { status: "failed"; error: unknown };
export class SessionCancelledError extends Error {
	constructor() {
		super("Session changed");
		this.name = "SessionCancelledError";
	}
}

class SessionStorageError extends Error {}

function newSessionId() {
	// getRandomValues remains available on origins where randomUUID is absent.
	return Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) =>
		byte.toString(16).padStart(2, "0"),
	).join("");
}

type SessionDependencies = {
	storage: () => Pick<Storage, "getItem" | "setItem" | "removeItem">;
	tabStorage: () => Pick<Storage, "getItem" | "setItem" | "removeItem">;
	exclusive: <T>(work: () => T) => Promise<T>;
	listen: (changed: () => void) => () => void;
	password: typeof requestPasswordToken;
	dcc: typeof requestDccAccessToken;
	account: typeof fetchCurrentUser;
	redirect: typeof redirectToDccLogin;
};

/** Owns session acceptance. Transport and browser effects stay behind internal seams. */
export function createSession(deps: SessionDependencies) {
	let snapshot: SessionSnapshot = {
		status: "checking",
		user: null,
		pending: false,
		issue: null,
	};
	let record: SessionRecord | null = null;
	let version = 0;
	let initialized = false;
	let timer: ReturnType<typeof setTimeout> | undefined;
	let stopListening: (() => void) | undefined;
	let restoreWork: Promise<void> | undefined;
	let blockedStorage = false;
	const listeners = new Set<() => void>();
	const cacheClearers = new Set<() => void>();
	const exchanges = new Map<
		string,
		{ version: number; promise: Promise<LoginOutcome> }
	>();

	const clearCaches = () => {
		for (const clear of cacheClearers) clear();
	};
	function publish(next: SessionSnapshot) {
		snapshot = next;
		clearTimeout(timer);
		if (next.status === "authenticated" && record?.token) {
			const expiration = getTokenExpirationTime(record.token);
			if (expiration !== null) {
				const expected = record.id;
				const expectedVersion = version;
				const check = () => {
					if (record?.id !== expected) return;
					const delay = getSessionExpiryTimerDelay(expiration);
					if (delay <= 0) void end("expired", expected, expectedVersion);
					else timer = setTimeout(check, delay);
				};
				timer = setTimeout(check, getSessionExpiryTimerDelay(expiration));
			}
		}
		for (const listener of listeners) listener();
	}
	function unavailable(issue: SessionIssue) {
		publish({ status: "error", user: null, pending: false, issue });
	}
	function storageFailure() {
		version++;
		blockedStorage = true;
		record = null;
		clearCaches();
		unavailable("storage");
	}
	function read(): SessionRecord | null {
		try {
			return readRecord();
		} catch {
			throw new SessionStorageError("Unable to read session");
		}
	}
	function readRecord(): SessionRecord | null {
		const storage = deps.storage();
		const value = storage.getItem(SESSION_KEY);
		if (value !== null) {
			const parsed: unknown = JSON.parse(value);
			if (
				!parsed ||
				typeof parsed !== "object" ||
				!("id" in parsed) ||
				typeof parsed.id !== "string" ||
				!("token" in parsed) ||
				(parsed.token !== null && typeof parsed.token !== "string")
			) {
				throw new Error("Invalid session record");
			}
			return { id: parsed.id, token: parsed.token };
		}
		// Only legacy credentials migrate; a persisted role never grants access.
		const legacyToken = storage.getItem("ramitos-token");
		if (!legacyToken) return null;
		const migrated = { id: newSessionId(), token: legacyToken };
		write(migrated);
		return migrated;
	}
	function write(next: SessionRecord) {
		try {
			const storage = deps.storage();
			storage.setItem(SESSION_KEY, JSON.stringify(next));
			storage.removeItem("ramitos-token");
			storage.removeItem("ramitos-user");
		} catch {
			throw new SessionStorageError("Unable to persist session");
		}
	}
	function same(left: SessionRecord | null, right: SessionRecord | null) {
		return left?.id === right?.id && left?.token === right?.token;
	}
	function current(expected: SessionRecord, attempt: number) {
		return (
			version === attempt && same(record, expected) && same(read(), expected)
		);
	}
	async function end(
		issue: SessionIssue = null,
		expectedId?: string,
		expectedVersion?: number,
	) {
		// Withdraw access immediately, even when persistence fails.
		if (expectedVersion !== undefined && version !== expectedVersion) return;
		if (expectedId && record?.id !== expectedId) return;
		const attempt = ++version;
		initialized = true;
		clearCaches();
		publish({ status: "anonymous", user: null, pending: false, issue });
		try {
			await deps.exclusive(() => {
				if (attempt !== version) return;
				if (expectedId && read()?.id !== expectedId) return;
				const next = { id: newSessionId(), token: null };
				write(next);
				record = next;
				blockedStorage = false;
			});
			await synchronize();
		} catch {
			if (attempt === version) storageFailure();
		}
	}
	async function verify(expected: SessionRecord, attempt: number) {
		if (!expected.token) return;
		try {
			const expiresAt = getTokenExpirationTime(expected.token);
			if (expiresAt !== null && expiresAt <= Date.now()) {
				await end("expired", expected.id, attempt);
				return;
			}
			const user = await deps.account(expected.token);
			if (expiresAt !== null && expiresAt <= Date.now()) {
				await end("expired", expected.id, attempt);
				return;
			}
			await deps.exclusive(() => {
				if (!current(expected, attempt)) return;
				clearCaches();
				publish({ status: "authenticated", user, pending: false, issue: null });
			});
		} catch (error) {
			if (error instanceof SessionStorageError) {
				if (version === attempt) storageFailure();
				return;
			}
			let relevant: boolean;
			try {
				relevant = await deps.exclusive(() => current(expected, attempt));
			} catch {
				if (version === attempt) storageFailure();
				return;
			}
			if (!relevant || version !== attempt) return;
			if (
				error instanceof AccountVerificationError &&
				(error.status === 401 || error.status === 403)
			) {
				await end(
					error.status === 401 ? "expired" : "denied",
					expected.id,
					attempt,
				);
			} else unavailable("verification");
		}
	}
	async function synchronize(force = false) {
		if (blockedStorage && !force) return;
		const requestedVersion = version;
		let expected: SessionRecord | null;
		let attempt: number;
		try {
			const result = await deps.exclusive(() => {
				// Restoration queued before a user action cannot supersede it.
				if (version !== requestedVersion) return null;
				const next = read();
				if (initialized && same(next, record) && !force) return null;
				const changedSession = initialized || next?.token;
				initialized = true;
				blockedStorage = false;
				record = next;
				const nextVersion = ++version;
				if (changedSession) clearCaches();
				publish({
					status: next?.token ? "checking" : "anonymous",
					user: null,
					pending: false,
					issue: null,
				});
				return { next, nextVersion };
			});
			if (!result) {
				// Re-arm after reconnect and check expiry when a suspended tab resumes.
				if (snapshot.status === "authenticated") publish(snapshot);
				return;
			}
			expected = result.next;
			attempt = result.nextVersion;
		} catch {
			storageFailure();
			return;
		}
		if (expected?.token) await verify(expected, attempt);
	}
	function retry() {
		if (restoreWork) return restoreWork;
		// A failed logout/write must not silently restore credentials on retry.
		if (blockedStorage) return end();
		restoreWork = synchronize(true).finally(() => {
			restoreWork = undefined;
		});
		return restoreWork;
	}
	async function begin(
		attempt: number,
		expectedId?: string,
	): Promise<SessionRecord | null> {
		return deps.exclusive(() => {
			if (version !== attempt) return null;
			if (expectedId && read()?.id !== expectedId) return null;
			const next = { id: newSessionId(), token: null };
			write(next);
			record = next;
			blockedStorage = false;
			return next;
		});
	}
	function prepare() {
		initialized = true;
		const attempt = ++version;
		clearCaches();
		publish({ status: "checking", user: null, pending: true, issue: null });
		return attempt;
	}
	async function login(
		tokenRequest: () => Promise<string>,
		attempt: number,
		expectedId?: string,
	): Promise<LoginOutcome> {
		let expected: SessionRecord | null = null;
		try {
			try {
				expected = await begin(attempt, expectedId);
			} catch (error) {
				if (version !== attempt) return { status: "cancelled" };
				storageFailure();
				return { status: "failed", error };
			}
			if (!expected) {
				await synchronize(version === attempt);
				return { status: "cancelled" };
			}
			const token = await tokenRequest();
			// Persist pending credentials for retry only if this login is still current.
			const saved = await deps.exclusive(() => {
				if (!expected || !current(expected, attempt)) return null;
				const next = { id: expected.id, token };
				write(next);
				record = next;
				return next;
			});
			if (!saved) {
				await synchronize();
				return { status: "cancelled" };
			}
			expected = saved;
			await verify(saved, attempt);
			const accepted = await deps.exclusive(() => current(saved, attempt));
			if (!accepted) {
				await synchronize();
				return { status: "cancelled" };
			}
			if (snapshot.status !== "authenticated")
				return {
					status: "failed",
					error: new Error("Account verification failed"),
				};
			return { status: "accepted" };
		} catch (error) {
			if (error instanceof SessionStorageError) {
				if (version !== attempt) return { status: "cancelled" };
				storageFailure();
				return { status: "failed", error };
			}
			try {
				if (
					expected &&
					(await deps.exclusive(
						() => expected !== null && current(expected, attempt),
					))
				) {
					if (version !== attempt) return { status: "cancelled" };
					publish({
						status: "anonymous",
						user: null,
						pending: false,
						issue: null,
					});
					return { status: "failed", error };
				}
			} catch {
				if (version === attempt) storageFailure();
				return { status: "failed", error };
			}
			await synchronize();
			return { status: "cancelled" };
		}
	}
	function password(credentials: LoginCredentials) {
		return login(() => deps.password(credentials), prepare());
	}
	function completeDcc(secret: string): Promise<LoginOutcome> {
		const normalized = secret.trim();
		const existing = exchanges.get(normalized);
		if (existing) {
			return existing.promise.then(async (outcome): Promise<LoginOutcome> => {
				try {
					const valid = await deps.exclusive(
						() => existing.version === version && same(read(), record),
					);
					return valid ? outcome : { status: "cancelled" };
				} catch {
					storageFailure();
					return { status: "cancelled" };
				}
			});
		}
		const attempt = prepare();
		const promise = (async (): Promise<LoginOutcome> => {
			let expectedId: string | undefined;
			try {
				expectedId = deps.tabStorage().getItem(DCC_ATTEMPT_KEY) ?? undefined;
			} catch (error) {
				storageFailure();
				return { status: "failed", error };
			}
			if (!normalized) {
				publish({
					status: "anonymous",
					user: null,
					pending: false,
					issue: null,
				});
				return { status: "failed", error: new Error("Missing DCC secret") };
			}
			return login(() => deps.dcc(normalized), attempt, expectedId);
		})();
		exchanges.set(normalized, { version: attempt, promise });
		return promise;
	}
	async function startDcc(returnPath?: string) {
		const attempt = prepare();
		try {
			const next = await begin(attempt);
			if (!next) return;
			deps.tabStorage().setItem(DCC_ATTEMPT_KEY, next.id);
			deps.redirect(returnPath);
		} catch {
			if (attempt === version) storageFailure();
		}
	}
	async function authenticated<T extends { status: number }>(
		request: (headers: HeadersInit) => Promise<T>,
	): Promise<T> {
		const expected = record;
		const attempt = version;
		if (snapshot.status !== "authenticated" || !expected?.token)
			throw new SessionCancelledError();
		await synchronize();
		if (version !== attempt || !same(record, expected))
			throw new SessionCancelledError();
		const expiresAt = getTokenExpirationTime(expected.token);
		if (expiresAt !== null && expiresAt <= Date.now()) {
			await end("expired", expected.id, attempt);
			throw new SessionCancelledError();
		}
		let response: T;
		try {
			response = await request({ Authorization: `Bearer ${expected.token}` });
		} catch (error) {
			let valid: boolean;
			try {
				valid = await deps.exclusive(() => current(expected, attempt));
			} catch {
				storageFailure();
				throw new SessionCancelledError();
			}
			if (!valid) {
				await synchronize();
				throw new SessionCancelledError();
			}
			throw error;
		}
		let valid: boolean;
		try {
			valid = await deps.exclusive(() => current(expected, attempt));
		} catch {
			storageFailure();
			throw new SessionCancelledError();
		}
		if (!valid) {
			await synchronize();
			throw new SessionCancelledError();
		}
		if (response.status === 401) {
			await end("expired", expected.id, attempt);
			throw new SessionCancelledError();
		}
		return response;
	}
	return {
		getSnapshot: () => snapshot,
		subscribe: (listener: () => void) => {
			listeners.add(listener);
			return () => {
				listeners.delete(listener);
			};
		},
		connect(clearCache: () => void) {
			cacheClearers.add(clearCache);
			if (!stopListening)
				stopListening = deps.listen(() => {
					void synchronize();
				});
			if (!initialized || !snapshot.pending) void synchronize();
			return () => {
				cacheClearers.delete(clearCache);
				if (!cacheClearers.size) {
					stopListening?.();
					stopListening = undefined;
					clearTimeout(timer);
				}
			};
		},
		retry,
		login: password,
		completeDccLogin: completeDcc,
		startDccLogin: startDcc,
		logout: () => end(),
		authenticated,
	};
}

export type Session = ReturnType<typeof createSession>;
export const session = createSession({
	storage: () => window.localStorage,
	tabStorage: () => window.sessionStorage,
	exclusive: browserSessionExclusive,
	listen(changed) {
		const storage = (event: StorageEvent) => {
			if (
				event.key === SESSION_KEY ||
				event.key === null ||
				event.key === "ramitos-token"
			)
				changed();
		};
		const visible = () => {
			if (document.visibilityState === "visible") changed();
		};
		window.addEventListener("storage", storage);
		window.addEventListener("focus", changed);
		document.addEventListener("visibilitychange", visible);
		return () => {
			window.removeEventListener("storage", storage);
			window.removeEventListener("focus", changed);
			document.removeEventListener("visibilitychange", visible);
		};
	},
	password: requestPasswordToken,
	dcc: requestDccAccessToken,
	account: fetchCurrentUser,
	redirect: redirectToDccLogin,
});
