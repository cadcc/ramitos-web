import { faker } from "@faker-js/faker";
import { getSelf } from "../../../generated/api/account/accountService";
import type { GetSelfResponseContent } from "../../../generated/api/account/models";
import {
	dccLoginExchangeTokens,
	getDccLoginExchangeTokensUrl,
	getDccLoginStartUrl,
	passwordLogin,
} from "../../../generated/api/authentication/authenticationService";
import type { User } from "../../../shared/types/domain";

const TOKEN_STORAGE_KEY = "ramitos-token";
const USER_STORAGE_KEY = "ramitos-user";
const DCC_RETURN_PATH_STORAGE_KEY = "ramitos-dcc-login-return-path";
const SESSION_EXPIRED_EVENT = "ramitos-session-expired";
const DCC_CALLBACK_PATH = "/auth/dcc/callback";
const MAX_TIMER_DELAY_MS = 2_147_483_647;

const dccTokenExchanges = new Map<string, Promise<User>>();

export class DccLoginConfigurationError extends Error {
	constructor() {
		super("DCC login is not configured for this frontend origin");
		this.name = "DccLoginConfigurationError";
	}
}

export function isDccLoginConfigurationError(
	error: unknown,
): error is DccLoginConfigurationError {
	return error instanceof Error && error.name === "DccLoginConfigurationError";
}

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
	const padded = value.padEnd(
		value.length + ((4 - (value.length % 4)) % 4),
		"=",
	);
	return atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
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

export function getTokenExpirationTime(
	token = getStoredToken(),
): number | null {
	if (!token) return null;
	const payload = tokenPayload(token);
	const exp = Number(payload?.exp);
	if (!Number.isFinite(exp)) return null;
	return exp * 1000;
}

export function getSessionExpiryTimerDelay(
	expiresAt: number,
	now = Date.now(),
): number {
	return Math.min(Math.max(expiresAt - now, 0), MAX_TIMER_DELAY_MS);
}

function accountScore(accountId: number): number {
	// TODO(backend): Replace with account score/reputation once exposed by AccountService.
	// TODO(backend): Once account profile data is complete, switch AuthContext to the generated useGetSelf hook.
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

export function storeSession(token: string, user: User) {
	localStorage.setItem(TOKEN_STORAGE_KEY, token);
	localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export function clearSession() {
	localStorage.removeItem(TOKEN_STORAGE_KEY);
	localStorage.removeItem(USER_STORAGE_KEY);
}

function isSafeInternalPath(path: string): boolean {
	if (!path.startsWith("/") || path.startsWith("//")) return false;
	try {
		return (
			new URL(path, window.location.origin).origin === window.location.origin
		);
	} catch {
		return false;
	}
}

export function getDccLoginReturnPath(requestedPath?: string): string {
	if (requestedPath && isSafeInternalPath(requestedPath)) return requestedPath;
	const stored = sessionStorage.getItem(DCC_RETURN_PATH_STORAGE_KEY);
	return stored && isSafeInternalPath(stored) ? stored : "/";
}

export function clearDccLoginReturnPath() {
	sessionStorage.removeItem(DCC_RETURN_PATH_STORAGE_KEY);
}

function getDccAuthOrigin(): string {
	const configuredOrigin = import.meta.env.VITE_AUTH_API_ORIGIN?.trim();
	if (!configuredOrigin) return window.location.origin;
	try {
		return new URL(configuredOrigin).origin;
	} catch {
		return window.location.origin;
	}
}

export function startDccLogin(requestedReturnPath?: string) {
	const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
	const returnPath =
		requestedReturnPath && isSafeInternalPath(requestedReturnPath)
			? requestedReturnPath
			: currentPath.startsWith(DCC_CALLBACK_PATH)
				? "/"
				: currentPath;
	clearSession();
	sessionStorage.setItem(DCC_RETURN_PATH_STORAGE_KEY, returnPath);

	const authOrigin = getDccAuthOrigin();
	const redirect = new URL(DCC_CALLBACK_PATH, window.location.origin);
	redirect.searchParams.set("returnTo", returnPath);
	const loginUrl = new URL(
		getDccLoginStartUrl({ redirect: redirect.toString() }),
		authOrigin,
	);
	window.location.assign(loginUrl.toString());
}

export async function fetchCurrentUser(
	token = getStoredToken(),
): Promise<User | null> {
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
		if (response.status === 200) return toUser(response.data);
		if (isAuthExpiredStatus(response.status)) {
			notifySessionExpired();
			return null;
		}
	} catch {
		clearSession();
		return null;
	}
	clearSession();
	return null;
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
	if (loginResponse.status !== 200 || !loginResponse.data.accessToken) {
		throw new Error("Invalid login response");
	}

	const token = loginResponse.data.accessToken;
	const user = await fetchCurrentUser(token);
	if (!user) throw new Error("Unable to load account");

	storeSession(token, user);
	return user;
}

async function requestDccAccessToken(secret: string): Promise<string> {
	const authOrigin = getDccAuthOrigin();
	if (authOrigin !== window.location.origin) {
		try {
			const response = await fetch(
				new URL(getDccLoginExchangeTokensUrl(), authOrigin),
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ secret }),
					credentials: "include",
				},
			);
			if (!response.ok) throw new Error("DCC token exchange failed");
			const data = (await response.json()) as { accessToken?: string };
			if (!data.accessToken) throw new Error("DCC token exchange failed");
			return data.accessToken;
		} catch (error) {
			if (error instanceof TypeError) throw new DccLoginConfigurationError();
			throw error;
		}
	}

	const response = await dccLoginExchangeTokens(
		{ secret },
		{ credentials: "same-origin" },
	);
	if (response.status === 200 && response.data.accessToken) {
		return response.data.accessToken;
	}
	throw new Error("DCC token exchange failed");
}

async function exchangeDccLoginSecret(secret: string): Promise<User> {
	const token = await requestDccAccessToken(secret);

	const user = await fetchCurrentUser(token);
	if (!user) throw new Error("Unable to load DCC account");

	storeSession(token, user);
	return user;
}

export function loginWithDccSecret(secret: string): Promise<User> {
	const normalizedSecret = secret.trim();
	if (!normalizedSecret) return Promise.reject(new Error("Missing DCC secret"));

	const existing = dccTokenExchanges.get(normalizedSecret);
	if (existing) return existing;

	const exchange = exchangeDccLoginSecret(normalizedSecret);
	dccTokenExchanges.set(normalizedSecret, exchange);
	exchange.catch(() => {
		if (dccTokenExchanges.get(normalizedSecret) === exchange) {
			dccTokenExchanges.delete(normalizedSecret);
		}
	});
	return exchange;
}
