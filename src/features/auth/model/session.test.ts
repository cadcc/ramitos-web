// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { waitFor } from "@testing-library/react";
import type { User } from "../../../shared/types/domain";
import { AccountVerificationError } from "../api/auth.api";
import { SESSION_KEY, SessionCancelledError } from "./session";
import { deferred, testBrowser, memoryStorage } from "./session.test-support";
const user: User = {
	id: 1,
	name: "Student",
	username: "student",
	role: "stats",
	score: 0,
	createdAt: "2026-01-01",
};
const credentials = { username: "student", password: "test" };
afterEach(() => {
	vi.restoreAllMocks();
	vi.useRealTimers();
});

describe("session ownership", () => {
	it.each(["password", "dcc"] as const)(
		"logout wins over pending %s login and duplicate callback replay",
		async (kind) => {
			const browser = testBrowser();
			const token = deferred<string>();
			const request = vi.fn(() => token.promise);
			const owner = browser.tab({
				password: request,
				dcc: request,
				account: vi.fn().mockResolvedValue(user),
			});
			const pending =
				kind === "password"
					? owner.login(credentials)
					: owner.completeDccLogin("secret");
			await waitFor(() => expect(request).toHaveBeenCalledOnce());
			await owner.logout();
			token.resolve("late-token");
			expect(await pending).toEqual({ status: "cancelled" });
			if (kind === "dcc")
				expect(await owner.completeDccLogin("secret")).toEqual({
					status: "cancelled",
				});
			expect(owner.getSnapshot().user).toBeNull();
			expect(JSON.parse(browser.storage.getItem(SESSION_KEY)!)).toMatchObject({
				token: null,
			});
		},
	);

	it("latest login intent wins even when it fails", async () => {
		const browser = testBrowser();
		const first = deferred<string>();
		const password = vi
			.fn()
			.mockReturnValueOnce(first.promise)
			.mockRejectedValueOnce(new Error("bad credentials"));
		const owner = browser.tab({
			password,
			account: vi.fn().mockResolvedValue(user),
		});
		const pending = owner.login(credentials);
		await waitFor(() => expect(password).toHaveBeenCalledTimes(1));
		expect((await owner.login(credentials)).status).toBe("failed");
		first.resolve("old");
		expect((await pending).status).toBe("cancelled");
		expect(owner.getSnapshot().status).toBe("anonymous");
	});

	it.each([200, 401])(
		"rejects old-session HTTP %s after account switching",
		async (status) => {
			const browser = testBrowser();
			const owner = browser.tab({
				password: vi.fn().mockResolvedValue("token"),
				account: vi.fn().mockResolvedValue(user),
			});
			await owner.login(credentials);
			const reply = deferred<{ status: number }>();
			const request = vi.fn(() => reply.promise);
			const pending = owner
				.authenticated(request)
				.catch((error: unknown) => error);
			await waitFor(() => expect(request).toHaveBeenCalledOnce());
			await owner.login(credentials);
			reply.resolve({ status });
			expect(await pending).toBeInstanceOf(SessionCancelledError);
			expect(owner.getSnapshot().status).toBe("authenticated");
		},
	);

	it("synchronizes tabs and rejects late work even before an event arrives", async () => {
		const browser = testBrowser();
		const account = vi.fn().mockResolvedValue(user);
		const first = browser.tab({
			password: vi.fn().mockResolvedValue("one"),
			account,
		});
		const second = browser.tab({
			password: vi.fn().mockResolvedValue("two"),
			account,
		});
		const cacheA = vi.fn(),
			cacheB = vi.fn();
		const stopA = first.connect(cacheA),
			stopB = second.connect(cacheB);
		await waitFor(() => expect(second.getSnapshot().status).toBe("anonymous"));
		await first.login(credentials);
		browser.emit();
		await waitFor(() =>
			expect(second.getSnapshot().status).toBe("authenticated"),
		);
		const reply = deferred<{ status: number }>();
		const request = vi.fn(() => reply.promise);
		const pending = first
			.authenticated(request)
			.catch((error: unknown) => error);
		await waitFor(() => expect(request).toHaveBeenCalledOnce());
		await second.logout();
		reply.resolve({ status: 401 });
		expect(await pending).toBeInstanceOf(SessionCancelledError);
		expect(first.getSnapshot().status).toBe("anonymous");
		expect(cacheA).toHaveBeenCalled();
		expect(cacheB).toHaveBeenCalled();
		const writes = browser.storage.setItem.mock.calls.length;
		browser.emit();
		browser.emit();
		await Promise.resolve();
		expect(browser.storage.setItem).toHaveBeenCalledTimes(writes);
		stopA();
		stopB();
	});

	it("preserves credentials on network failure and retries verification", async () => {
		const browser = testBrowser();
		browser.storage.setItem("ramitos-token", "existing");
		browser.storage.setItem(
			"ramitos-user",
			JSON.stringify({ ...user, role: "admin" }),
		);
		const account = vi
			.fn()
			.mockRejectedValueOnce(new TypeError("offline"))
			.mockResolvedValueOnce(user);
		const owner = browser.tab({ account });
		await owner.retry();
		expect(owner.getSnapshot()).toMatchObject({
			status: "error",
			issue: "verification",
			user: null,
		});
		expect(browser.storage.getItem(SESSION_KEY)).toContain("existing");
		expect(browser.storage.getItem("ramitos-user")).toBeNull();
		await owner.retry();
		expect(owner.getSnapshot()).toMatchObject({
			status: "authenticated",
			user,
		});
	});

	it.each([401, 403])(
		"clears credentials when account verification returns %s",
		async (status) => {
			const browser = testBrowser();
			browser.storage.setItem("ramitos-token", "existing");
			const owner = browser.tab({
				account: vi
					.fn()
					.mockRejectedValue(new AccountVerificationError(status)),
			});
			await owner.retry();
			expect(owner.getSnapshot()).toMatchObject({
				status: "anonymous",
				issue: status === 401 ? "expired" : "denied",
			});
			expect(JSON.parse(browser.storage.getItem(SESSION_KEY)!)).toMatchObject({
				token: null,
			});
		},
	);

	it("a feature 403 does not end the session, but a current 401 does", async () => {
		const owner = testBrowser().tab({
			password: vi.fn().mockResolvedValue("token"),
			account: vi.fn().mockResolvedValue(user),
		});
		await owner.login(credentials);
		expect(
			await owner.authenticated(() => Promise.resolve({ status: 403 })),
		).toEqual({
			status: 403,
		});
		expect(owner.getSnapshot().status).toBe("authenticated");
		await expect(
			owner.authenticated(() => Promise.resolve({ status: 401 })),
		).rejects.toBeInstanceOf(SessionCancelledError);
		expect(owner.getSnapshot().issue).toBe("expired");
	});

	it("withdraws access on failed logout persistence and retries the logout", async () => {
		const browser = testBrowser();
		const owner = browser.tab({
			password: vi.fn().mockResolvedValue("token"),
			account: vi.fn().mockResolvedValue(user),
		});
		await owner.login(credentials);
		browser.storage.setItem.mockImplementationOnce(() => {
			throw new Error("storage disabled");
		});
		await owner.logout();
		expect(owner.getSnapshot()).toMatchObject({
			status: "error",
			issue: "storage",
			user: null,
		});
		await owner.retry();
		expect(owner.getSnapshot().status).toBe("anonymous");
		expect(JSON.parse(browser.storage.getItem(SESSION_KEY)!)).toMatchObject({
			token: null,
		});
	});

	it("recovers from a corrupt session record without trusting it", async () => {
		const browser = testBrowser();
		browser.storage.setItem(SESSION_KEY, "bad-json");
		const owner = browser.tab();
		await owner.retry();
		expect(owner.getSnapshot().issue).toBe("storage");
		await owner.retry();
		expect(owner.getSnapshot().status).toBe("anonymous");
	});

	it("deduplicates DCC completion and ignores a callback superseded in another tab", async () => {
		const browser = testBrowser();
		const dcc = vi.fn().mockResolvedValue("token");
		const tabStorage = memoryStorage();
		const redirect = vi.fn();
		const owner = browser.tab({
			dcc,
			tabStorage: () => tabStorage,
			redirect,
			account: vi.fn().mockResolvedValue(user),
		});
		await owner.startDccLogin("/malla");
		expect(redirect).toHaveBeenCalledWith("/malla");
		const replacement = browser.tab();
		await replacement.logout();
		const outcomes = await Promise.all([
			owner.completeDccLogin("old-secret"),
			owner.completeDccLogin("old-secret"),
		]);
		expect(outcomes.map((value) => value.status)).toEqual([
			"cancelled",
			"cancelled",
		]);
		expect(dcc).not.toHaveBeenCalled();
	});
});

it("does not send an old caller's operation under a replacement account", async () => {
	const browser = testBrowser();
	const account = vi.fn().mockResolvedValue(user);
	const first = browser.tab({
		password: vi.fn().mockResolvedValue("one"),
		account,
	});
	const second = browser.tab({
		password: vi.fn().mockResolvedValue("two"),
		account,
	});
	await first.login(credentials);
	await second.login(credentials);
	const request = vi.fn().mockResolvedValue({ status: 200 });
	await expect(first.authenticated(request)).rejects.toBeInstanceOf(
		SessionCancelledError,
	);
	expect(request).not.toHaveBeenCalled();
});

it("reports a credential write failure without accepting the login", async () => {
	const browser = testBrowser();
	const token = deferred<string>();
	const password = vi.fn(() => token.promise);
	const owner = browser.tab({
		password,
		account: vi.fn().mockResolvedValue(user),
	});
	const pending = owner.login(credentials);
	await waitFor(() => expect(password).toHaveBeenCalled());
	browser.storage.setItem.mockImplementationOnce(() => {
		throw new Error("quota");
	});
	token.resolve("token");
	expect((await pending).status).toBe("failed");
	expect(owner.getSnapshot()).toMatchObject({
		status: "error",
		issue: "storage",
		user: null,
	});
});

it("reports unavailable storage and permits recovery", async () => {
	const browser = testBrowser();
	browser.storage.getItem.mockImplementationOnce(() => {
		throw new Error("blocked");
	});
	const owner = browser.tab();
	await owner.retry();
	expect(owner.getSnapshot().issue).toBe("storage");
	await owner.retry();
	expect(owner.getSnapshot().status).toBe("anonymous");
});

it("expires after reconnect and clears cached data", async () => {
	vi.useFakeTimers();
	const browser = testBrowser();
	const token = `e30.${btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 10 }))}.signature`;
	const owner = browser.tab({
		password: vi.fn().mockResolvedValue(token),
		account: vi.fn().mockResolvedValue(user),
	});
	await owner.login(credentials);
	const clear = vi.fn();
	const disconnect = owner.connect(clear);
	await Promise.resolve();
	disconnect();
	const stop = owner.connect(clear);
	await vi.advanceTimersByTimeAsync(11000);
	expect(owner.getSnapshot()).toMatchObject({
		status: "anonymous",
		issue: "expired",
	});
	expect(clear).toHaveBeenCalled();
	stop();
});

it("does not replay a successful DCC result after another tab logs out", async () => {
	const browser = testBrowser();
	const dcc = vi.fn().mockResolvedValue("token");
	const first = browser.tab({ dcc, account: vi.fn().mockResolvedValue(user) });
	expect((await first.completeDccLogin("secret")).status).toBe("accepted");
	await browser.tab().logout();
	expect((await first.completeDccLogin("secret")).status).toBe("cancelled");
	expect(dcc).toHaveBeenCalledOnce();
});

it("settles a cancelled callback after local logout without leaving login pending", async () => {
	const browser = testBrowser();
	const tabStorage = memoryStorage();
	const dcc = vi.fn();
	const owner = browser.tab({
		tabStorage: () => tabStorage,
		redirect: vi.fn(),
		dcc,
	});
	await owner.startDccLogin();
	await owner.logout();
	expect((await owner.completeDccLogin("old-callback")).status).toBe(
		"cancelled",
	);
	expect(owner.getSnapshot()).toMatchObject({
		status: "anonymous",
		pending: false,
	});
	expect(dcc).not.toHaveBeenCalled();
});

it("a queued restoration cannot supersede a newly started login", async () => {
	const browser = testBrowser();
	browser.storage.setItem("ramitos-token", "previous-account");
	const owner = browser.tab({
		password: vi.fn().mockResolvedValue("new-account"),
		account: vi.fn().mockResolvedValue(user),
	});
	const stop = owner.connect(vi.fn());
	expect((await owner.login(credentials)).status).toBe("accepted");
	expect(JSON.parse(browser.storage.getItem(SESSION_KEY)!)).toMatchObject({
		token: "new-account",
	});
	stop();
});
