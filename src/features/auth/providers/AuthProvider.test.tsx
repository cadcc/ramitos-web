// @vitest-environment jsdom
import {
	act,
	cleanup,
	renderHook,
	waitFor,
	render,
	screen,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StrictMode, type ReactNode } from "react";
import { AuthProvider, useAuth } from "./AuthProvider";
import type { User } from "../../../shared/types/domain";
import { deferred, testBrowser } from "../model/session.test-support";
import type { Session } from "../model/session";
const user: User = {
	id: 1,
	name: "Student",
	username: "student",
	role: "stats",
	score: 0,
	createdAt: "2026-01-01",
};
afterEach(cleanup);
function setup(owner: Session) {
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	const wrapper = ({ children }: { children: ReactNode }) => (
		<StrictMode>
			<QueryClientProvider client={client}>
				<AuthProvider owner={owner}>{children}</AuthProvider>
			</QueryClientProvider>
		</StrictMode>
	);
	return { client, wrapper, ...renderHook(() => useAuth(), { wrapper }) };
}
describe("session consumers", () => {
	it("clears account data on logout and rejects late restoration", async () => {
		const browser = testBrowser();
		browser.storage.setItem("ramitos-token", "token");
		const loaded = deferred<User>();
		const account = vi.fn(() => loaded.promise);
		const owner = browser.tab({ account });
		const { client, result } = setup(owner);
		await waitFor(() => expect(account).toHaveBeenCalled());
		client.setQueryData(["adminReviews"], { private: true });
		await act(() => owner.logout());
		await act(async () => {
			loaded.resolve(user);
			await loaded.promise;
		});
		expect(result.current.user).toBeNull();
		expect(client.getQueryCache().getAll()).toHaveLength(0);
	});
	it("clears prior data before consumers see another verified account", async () => {
		const browser = testBrowser();
		const owner = browser.tab({
			password: vi.fn().mockResolvedValue("token"),
			account: vi.fn().mockResolvedValue({ ...user, id: 2 }),
		});
		const { client, result } = setup(owner);
		await waitFor(() => expect(result.current.status).toBe("anonymous"));
		client.setQueryData(["adminReviews"], { private: true });
		await act(() =>
			result.current.login({ username: "other", password: "test" }),
		);
		expect(result.current.user?.id).toBe(2);
		expect(client.getQueryCache().getAll()).toHaveLength(0);
	});
	it("offers retry without granting access during a temporary failure", async () => {
		const browser = testBrowser();
		browser.storage.setItem("ramitos-token", "token");
		const account = vi.fn().mockRejectedValue(new TypeError("offline"));
		const owner = browser.tab({ account });
		const { wrapper, result } = setup(owner);
		render(<div>Contenido público</div>, { wrapper });
		await waitFor(() => expect(result.current.status).toBe("error"));
		expect(result.current.isAuthenticated).toBe(false);
		expect(screen.getByText("Contenido público")).toBeTruthy();
		expect(
			screen.getAllByRole("button", { name: "Reintentar" }).length,
		).toBeGreaterThan(0);
		account.mockResolvedValue(user);
		await act(() => owner.retry());
		expect(result.current.isAuthenticated).toBe(true);
	});
});
