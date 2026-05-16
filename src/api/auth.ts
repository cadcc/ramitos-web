import { faker } from "@faker-js/faker";
import { getSelf } from "./account/accountService";
import type { GetSelfResponseContent } from "./account/models";
import { passwordLogin } from "./authentication/authenticationService";
import type { AccountRole, User } from "./types";

const TOKEN_STORAGE_KEY = "ramitos-token";
const USER_STORAGE_KEY = "ramitos-user";
const SESSION_EXPIRED_EVENT = "ramitos-session-expired";

export interface LoginCredentials {
	username: string;
	password: string;
}

export function getStoredToken(): string | null {
	return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function getAuthHeaders(token = getStoredToken()): HeadersInit {
	return token ? { Authorization: `Bearer ${token}` } : {};
}

export function onSessionExpired(listener: () => void): () => void {
	window.addEventListener(SESSION_EXPIRED_EVENT, listener);
	return () => window.removeEventListener(SESSION_EXPIRED_EVENT, listener);
}

export function notifySessionExpired() {
	window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
}

export function isAuthExpiredStatus(status: number): boolean {
	return status === 401;
}

function timeoutSignal(ms: number): AbortSignal {
	const controller = new AbortController();
	window.setTimeout(() => controller.abort(), ms);
	return controller.signal;
}

function decodeBase64Url(value: string): string {
	const padded = value.padEnd(value.length + ((4 - (value.length % 4)) % 4), "=");
	return atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
}

function normalizeRole(role: unknown): AccountRole {
	if (typeof role === "string") return role as AccountRole;
	if (role && typeof role === "object") {
		const key = Object.keys(role)[0]?.toLowerCase();
		if (key) return key as AccountRole;
	}
	return "none";
}

function tokenPayload(token: string): Record<string, unknown> | null {
	try {
		return JSON.parse(decodeBase64Url(token.split(".")[1] ?? ""));
	} catch {
		return null;
	}
}

export function isTokenExpired(token = getStoredToken()): boolean {
	const expiresAt = getTokenExpirationTime(token);
	return expiresAt !== null && expiresAt <= Date.now();
}

export function getTokenExpirationTime(token = getStoredToken()): number | null {
	if (!token) return null;
	const payload = tokenPayload(token);
	const exp = Number(payload?.exp);
	if (!Number.isFinite(exp)) return null;
	return exp * 1000;
}

function accountScore(accountId: number): number {
	// TODO(backend): Replace with account score/reputation once exposed by AccountService.
	faker.seed(accountId + 700);
	return faker.number.int({ min: 0, max: 240 });
}

export function toUser(account: GetSelfResponseContent): User {
	return {
		id: account.id,
		name: account.name,
		username: account.name,
		role: account.role,
		score: accountScore(account.id),
		createdAt: account.created_at,
	};
}

function userFromToken(token: string): User | null {
	try {
		const payload = tokenPayload(token);
		if (!payload) return null;
		const account = payload.account;
		if (!account || typeof account !== "object") return null;
		const accountData = account as Record<string, unknown>;

		const id = Number(accountData.id);
		const name = String(accountData.displayName ?? accountData.name ?? "Usuario");
		return {
			id,
			name,
			username: name,
			role: normalizeRole(accountData.role),
			score: accountScore(id),
			createdAt: String(
				accountData.createdAt ?? accountData.created_at ?? new Date().toISOString(),
			),
		};
	} catch {
		return null;
	}
}

export function loadStoredUser(): User | null {
	try {
		const stored = localStorage.getItem(USER_STORAGE_KEY);
		if (stored) return JSON.parse(stored) as User;
	} catch {
		/* ignore */
	}
	return null;
}

export function storeSession(token: string, user: User) {
	localStorage.setItem(TOKEN_STORAGE_KEY, token);
	localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export function clearSession() {
	localStorage.removeItem(TOKEN_STORAGE_KEY);
	localStorage.removeItem(USER_STORAGE_KEY);
}

export async function fetchCurrentUser(token = getStoredToken()): Promise<User | null> {
	if (!token) return null;
	if (isTokenExpired(token)) {
		notifySessionExpired();
		return null;
	}
	try {
		const response = await getSelf({
			headers: getAuthHeaders(token),
			signal: timeoutSignal(5000),
		});
		if ((response as { status: number }).status < 400) return toUser(response.data);
		if (isAuthExpiredStatus((response as { status: number }).status)) {
			notifySessionExpired();
			return null;
		}
	} catch {
		/* fall back to token payload below */
	}
	// TODO(backend): Use AccountService as the sole source of current-user state once /api/accounts/@me responds reliably.
	return userFromToken(token);
}

export function handleAuthenticatedResponse(status: number): boolean {
	if (!isAuthExpiredStatus(status)) return false;
	notifySessionExpired();
	return true;
}

export async function loginWithPassword(
	credentials: LoginCredentials,
): Promise<User> {
	const loginResponse = await passwordLogin(credentials);
	if (
		(loginResponse as { status: number }).status >= 400 ||
		!loginResponse.data.accessToken
	) {
		throw new Error("Invalid login response");
	}

	const token = loginResponse.data.accessToken;
	const user = await fetchCurrentUser(token);
	if (!user) throw new Error("Unable to load account");

	storeSession(token, user);
	return user;
}

export function storeDevSession(role: AccountRole, user: User) {
	// TODO(backend): Remove this development fallback once shared test credentials exist.
	storeSession(`mock-jwt-${role}-${user.id}`, user);
}
