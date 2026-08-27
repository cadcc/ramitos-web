// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	clearDccLoginReturnPath,
	DccLoginConfigurationError,
	getDccLoginReturnPath,
	getSessionExpiryTimerDelay,
	isDccLoginConfigurationError,
	loginWithDccSecret,
} from "./auth.api";

const RETURN_PATH_KEY = "ramitos-dcc-login-return-path";

const apiMocks = vi.hoisted(() => ({
	dccLoginExchangeTokens: vi.fn(),
	getSelf: vi.fn(),
}));

vi.mock("../../../generated/api/authentication/authenticationService", () => ({
	dccLoginExchangeTokens: apiMocks.dccLoginExchangeTokens,
	getDccLoginExchangeTokensUrl: vi.fn(() => "/api/workflow/login/dcc/finish"),
	getDccLoginStartUrl: vi.fn(() => "/api/workflow/login/dcc/start"),
	passwordLogin: vi.fn(),
}));

vi.mock("../../../generated/api/account/accountService", () => ({
	getSelf: apiMocks.getSelf,
}));

describe("DCC login return path", () => {
	beforeEach(() => sessionStorage.clear());

	it("preserves a local path with search and hash", () => {
		sessionStorage.setItem(
			RETURN_PATH_KEY,
			"/curso/CC1000?reviewSort=newest#opiniones",
		);

		expect(getDccLoginReturnPath()).toBe(
			"/curso/CC1000?reviewSort=newest#opiniones",
		);
	});

	it.each(["https://example.com", "//example.com", "/\\example.com"])(
		"rejects unsafe return path %s",
		(path) => {
			sessionStorage.setItem(RETURN_PATH_KEY, path);
			expect(getDccLoginReturnPath()).toBe("/");
		},
	);

	it("clears the stored path after login", () => {
		sessionStorage.setItem(RETURN_PATH_KEY, "/malla");
		clearDccLoginReturnPath();
		expect(sessionStorage.getItem(RETURN_PATH_KEY)).toBeNull();
	});
});

describe("session expiry scheduling", () => {
	it("caps long-lived sessions at the browser timer limit", () => {
		const now = 1_000;
		expect(getSessionExpiryTimerDelay(now + 3_000_000_000, now)).toBe(
			2_147_483_647,
		);
	});

	it("returns zero for an expired session", () => {
		expect(getSessionExpiryTimerDelay(999, 1_000)).toBe(0);
	});
});

describe("DCC login errors", () => {
	it("recognizes configuration errors across module boundaries", () => {
		expect(isDccLoginConfigurationError(new DccLoginConfigurationError())).toBe(
			true,
		);
		expect(
			isDccLoginConfigurationError(
				Object.assign(new Error("configuration"), {
					name: "DccLoginConfigurationError",
				}),
			),
		).toBe(true);
	});
});

describe("DCC token exchange", () => {
	beforeEach(() => {
		vi.stubEnv("VITE_AUTH_API_ORIGIN", window.location.origin);
		localStorage.clear();
		apiMocks.dccLoginExchangeTokens.mockReset();
		apiMocks.getSelf.mockReset();
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("exchanges a one-time secret once and persists the verified account", async () => {
		const tokenPayload = btoa(
			JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }),
		)
			.replace(/\+/g, "-")
			.replace(/\//g, "_")
			.replace(/=+$/, "");
		const token = `e30.${tokenPayload}.signature`;
		apiMocks.dccLoginExchangeTokens.mockResolvedValue({
			status: 200,
			data: { accessToken: token },
			headers: new Headers(),
		});
		apiMocks.getSelf.mockResolvedValue({
			status: 200,
			data: {
				id: 42,
				name: "Usuario DCC",
				role: "student",
				created_at: "2026-01-01T00:00:00Z",
				updated_at: "2026-01-01T00:00:00Z",
			},
			headers: new Headers(),
		});

		const [firstUser, secondUser] = await Promise.all([
			loginWithDccSecret("one-time-secret"),
			loginWithDccSecret("one-time-secret"),
		]);

		expect(apiMocks.dccLoginExchangeTokens).toHaveBeenCalledOnce();
		expect(apiMocks.dccLoginExchangeTokens).toHaveBeenCalledWith(
			{ secret: "one-time-secret" },
			{ credentials: "same-origin" },
		);
		expect(firstUser).toEqual(secondUser);
		expect(firstUser.name).toBe("Usuario DCC");
		expect(localStorage.getItem("ramitos-token")).toBe(token);
		expect(
			JSON.parse(localStorage.getItem("ramitos-user") ?? "null"),
		).toMatchObject({ id: 42, name: "Usuario DCC" });
	});

	it("exchanges the secret directly with credentials across origins", async () => {
		vi.stubEnv("VITE_AUTH_API_ORIGIN", "https://auth.example.test");
		const tokenPayload = btoa(
			JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }),
		)
			.replace(/\+/g, "-")
			.replace(/\//g, "_")
			.replace(/=+$/, "");
		const token = `e30.${tokenPayload}.signature`;
		const fetchMock = vi.fn().mockResolvedValue(
			new Response(JSON.stringify({ accessToken: token }), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			}),
		);
		vi.stubGlobal("fetch", fetchMock);
		apiMocks.getSelf.mockResolvedValue({
			status: 200,
			data: {
				id: 43,
				name: "Usuario remoto",
				role: "student",
				created_at: "2026-01-01T00:00:00Z",
				updated_at: "2026-01-01T00:00:00Z",
			},
			headers: new Headers(),
		});

		await loginWithDccSecret("cross-origin-secret");

		expect(fetchMock).toHaveBeenCalledWith(
			new URL("/api/workflow/login/dcc/finish", "https://auth.example.test"),
			expect.objectContaining({
				method: "POST",
				credentials: "include",
				body: JSON.stringify({ secret: "cross-origin-secret" }),
			}),
		);
		expect(apiMocks.dccLoginExchangeTokens).not.toHaveBeenCalled();
	});
});
