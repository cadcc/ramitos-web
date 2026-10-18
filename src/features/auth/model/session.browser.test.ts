// @vitest-environment jsdom
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, useState } from "react";
import { deferred } from "./session.test-support";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { sessionDatabase } from "./indexedDb.test-support";
import type * as AuthApi from "../api/auth.api";

vi.mock("../api/auth.api", async (importOriginal) => {
	const actual = await importOriginal<typeof AuthApi>();
	return {
		...actual,
		requestPasswordToken: vi.fn().mockResolvedValue("test-session"),
		requestDccAccessToken: vi.fn().mockResolvedValue("test-dcc-session"),
		fetchCurrentUser: vi.fn().mockResolvedValue({
			id: 1,
			name: "Student",
			username: "student",
			role: "stats",
			score: 0,
			createdAt: "2026-01-01",
		}),
	};
});

let disconnect: (() => void) | undefined;
beforeEach(() => {
	vi.resetModules();
	window.localStorage.clear();
	window.sessionStorage.clear();
});
afterEach(() => {
	cleanup();
	disconnect?.();
	disconnect = undefined;
	vi.unstubAllGlobals();
});

it("lets the login dialog cancel a stalled request instead of trapping the page", async () => {
	vi.stubGlobal("navigator", { locks: undefined });
	vi.stubGlobal("indexedDB", sessionDatabase().factory);
	const api = await import("../api/auth.api");
	const token = deferred<string>();
	vi.mocked(api.requestPasswordToken).mockReturnValueOnce(token.promise);
	const { session } = await import("./session");
	const { AuthProvider, useAuth } = await import("../providers/AuthProvider");
	const { LoginDialog } = await import("../components/LoginDialog");
	function Page() {
		const auth = useAuth();
		const [clicks, setClicks] = useState(0);
		return createElement(
			"div",
			null,
			createElement(
				"button",
				{ onClick: auth.openLoginDialog },
				"Abrir ingreso",
			),
			createElement(
				"button",
				{ onClick: () => setClicks((previous) => previous + 1) },
				`Página ${clicks}`,
			),
			createElement(LoginDialog),
		);
	}
	const client = new QueryClient();
	render(
		createElement(
			QueryClientProvider,
			{ client },
			createElement(AuthProvider, {
				owner: session,
				children: createElement(Page),
			}),
		),
	);
	await waitFor(() => expect(session.getSnapshot().status).toBe("anonymous"));
	fireEvent.click(screen.getByRole("button", { name: "Abrir ingreso" }));
	let pending: ReturnType<typeof session.login> | undefined;
	act(() => {
		pending = session.login({ username: "student", password: "test" });
	});
	await waitFor(() => expect(session.getSnapshot().pending).toBe(true));
	const cancel = screen.getByRole<HTMLButtonElement>("button", {
		name: "Cancelar",
	});
	expect(cancel.disabled).toBe(false);
	fireEvent.click(cancel);
	await waitFor(() => expect(session.getSnapshot().pending).toBe(false));
	await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
	fireEvent.click(screen.getByRole("button", { name: "Página 0" }));
	expect(screen.getByRole("button", { name: "Página 1" })).toBeTruthy();
	await act(async () => {
		token.resolve("late-test-session");
		await pending;
	});
	expect(session.getSnapshot().status).toBe("anonymous");
});

it.each(["locks", "randomUUID", "both"])(
	"can restore, retry, log in and reload without %s",
	async (missing) => {
		const getRandomValues = crypto.getRandomValues.bind(crypto);
		vi.stubGlobal("navigator", {
			locks:
				missing === "randomUUID"
					? {
							request: <T>(_name: string, work: () => T) =>
								Promise.resolve().then(work),
						}
					: undefined,
		});
		if (missing !== "locks") vi.stubGlobal("crypto", { getRandomValues });
		const database = sessionDatabase();
		vi.stubGlobal("indexedDB", database.factory);
		const { session } = await import("./session");
		disconnect = session.connect(() => {});
		await waitFor(() => expect(session.getSnapshot().status).toBe("anonymous"));
		await session.retry();
		expect(session.getSnapshot().issue).toBeNull();
		expect(
			await session.login({ username: "student", password: "test" }),
		).toEqual({ status: "accepted" });
		expect(session.getSnapshot()).toMatchObject({
			status: "authenticated",
			pending: false,
		});
		disconnect();
		vi.resetModules();
		const reloaded = (await import("./session")).session;
		disconnect = reloaded.connect(() => {});
		await waitFor(() =>
			expect(reloaded.getSnapshot().status).toBe("authenticated"),
		);
		await reloaded.logout();
		expect(reloaded.getSnapshot()).toMatchObject({
			status: "anonymous",
			issue: null,
			pending: false,
		});
	},
);

it("recovers a corrupt saved session and completes DCC login without secure-context APIs", async () => {
	vi.stubGlobal("navigator", { locks: undefined });
	vi.stubGlobal("crypto", {
		getRandomValues: crypto.getRandomValues.bind(crypto),
	});
	vi.stubGlobal("indexedDB", sessionDatabase().factory);
	window.localStorage.setItem("ramitos-session-v1", "broken-json");
	const { session } = await import("./session");
	disconnect = session.connect(() => {});
	await waitFor(() => expect(session.getSnapshot().issue).toBe("storage"));
	await session.retry();
	expect(session.getSnapshot()).toMatchObject({
		status: "anonymous",
		issue: null,
		pending: false,
	});
	expect(await session.completeDccLogin("test-secret")).toEqual({
		status: "accepted",
	});
	expect(session.getSnapshot()).toMatchObject({
		status: "authenticated",
		pending: false,
	});
});
