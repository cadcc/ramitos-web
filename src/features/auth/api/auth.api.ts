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

const DCC_RETURN_PATH_STORAGE_KEY = "ramitos-dcc-login-return-path";
const DCC_CALLBACK_PATH = "/auth/dcc/callback";
const MAX_TIMER_DELAY_MS = 2_147_483_647;

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

function decodeBase64Url(value: string): string {
	const padded = value.padEnd(
		value.length + ((4 - (value.length % 4)) % 4),
		"=",
	);
	return atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
}

function tokenPayload(token: string): Record<string, unknown> | null {
	try {
		const value: unknown = JSON.parse(
			decodeBase64Url(token.split(".")[1] ?? ""),
		);
		return typeof value === "object" && value !== null && !Array.isArray(value)
			? (value as Record<string, unknown>)
			: null;
	} catch {
		return null;
	}
}

export function isTokenExpired(token: string | null): boolean {
	const expiresAt = getTokenExpirationTime(token);
	return expiresAt !== null && expiresAt <= Date.now();
}

export function getTokenExpirationTime(token: string | null): number | null {
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

export function redirectToDccLogin(requestedReturnPath?: string) {
	const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
	const returnPath =
		requestedReturnPath && isSafeInternalPath(requestedReturnPath)
			? requestedReturnPath
			: currentPath.startsWith(DCC_CALLBACK_PATH)
				? "/"
				: currentPath;

	sessionStorage.setItem(DCC_RETURN_PATH_STORAGE_KEY, returnPath);
	if (
		import.meta.env.DEV &&
		import.meta.env.VITE_API_MOCKING_ENABLED === "true"
	) {
		// Document navigations do not pass through MSW. Simulate the provider's
		// return locally, then let the normal callback exchange and verify a session.
		const callback = new URL(DCC_CALLBACK_PATH, window.location.origin);
		callback.searchParams.set("returnTo", returnPath);
		callback.searchParams.set("secret", "ramitos-mock-dcc");
		callback.searchParams.set("status", "ok");
		callback.searchParams.set("workflow", "dccLogin");
		window.location.assign(callback.toString());
		return;
	}

	const authOrigin = getDccAuthOrigin();
	const redirect = new URL(DCC_CALLBACK_PATH, window.location.origin);
	redirect.searchParams.set("returnTo", returnPath);
	const loginUrl = new URL(
		getDccLoginStartUrl({ redirect: redirect.toString() }),
		authOrigin,
	);
	window.location.assign(loginUrl.toString());
}

export class AccountVerificationError extends Error {
	constructor(public readonly status: number) {
		super("Account verification failed");
	}
}

export async function fetchCurrentUser(token: string): Promise<User> {
	const controller = new AbortController();
	const timeout = window.setTimeout(() => controller.abort(), 5000);
	try {
		const response = await getSelf({
			headers: { Authorization: `Bearer ${token}` },
			signal: controller.signal,
		});
		if (response.status !== 200)
			throw new AccountVerificationError(response.status);
		if (
			!response.data ||
			typeof response.data.id !== "number" ||
			typeof response.data.role !== "string"
		) {
			throw new Error("Invalid account response");
		}
		return toUser(response.data);
	} finally {
		window.clearTimeout(timeout);
	}
}

export async function requestPasswordToken(
	credentials: LoginCredentials,
): Promise<string> {
	const response = await passwordLogin(credentials);
	if (response.status !== 200 || !response.data.accessToken)
		throw new Error("Invalid login response");
	return response.data.accessToken;
}
export async function requestDccAccessToken(secret: string): Promise<string> {
	const authOrigin =
		import.meta.env.DEV && import.meta.env.VITE_API_MOCKING_ENABLED === "true"
			? window.location.origin
			: getDccAuthOrigin();
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
