import { vi } from "vitest";
import { createSession } from "./session";
import {
	fetchCurrentUser,
	requestPasswordToken,
	requestDccAccessToken,
	redirectToDccLogin,
} from "../api/auth.api";

export function memoryStorage() {
	const values = new Map<string, string>();
	return {
		getItem: vi.fn((key: string) => values.get(key) ?? null),
		setItem: vi.fn((key: string, value: string) => {
			values.set(key, value);
		}),
		removeItem: vi.fn((key: string) => {
			values.delete(key);
		}),
	};
}

export function testBrowser() {
	const storage = memoryStorage();
	const events = new Set<() => void>();
	let queue = Promise.resolve();
	function exclusive<T>(work: () => T): Promise<T> {
		const pending = queue.then(work);
		queue = pending.then(
			() => undefined,
			() => undefined,
		);
		return pending;
	}
	function tab(overrides: Partial<Parameters<typeof createSession>[0]> = {}) {
		return createSession({
			storage: () => storage,
			tabStorage: () => memoryStorage(),
			exclusive,
			listen: (callback) => {
				events.add(callback);
				return () => {
					events.delete(callback);
				};
			},
			password: requestPasswordToken,
			dcc: requestDccAccessToken,
			account: fetchCurrentUser,
			redirect: redirectToDccLogin,
			...overrides,
		});
	}
	return {
		storage,
		tab,
		emit: () => {
			for (const event of events) event();
		},
	};
}
export function deferred<T>() {
	let resolve!: (value: T) => void;
	let reject!: (error: unknown) => void;
	const promise = new Promise<T>((yes, no) => {
		resolve = yes;
		reject = no;
	});
	return { promise, resolve, reject };
}
