// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import type * as AuthApi from "../api/auth.api";
import type { ReactNode } from "react";
import { AuthProvider, useAuth } from "./AuthProvider";
import type { User } from "../../../shared/types/domain";

const api = vi.hoisted(() => ({
	fetchCurrentUser: vi.fn(),
	loginWithPassword: vi.fn(),
}));
vi.mock("../api/auth.api", async (importOriginal) => ({
	...(await importOriginal<typeof AuthApi>()),
	...api,
}));
const user: User = {
	id: 1,
	name: "Student",
	username: "student",
	role: "stats",
	score: 0,
	createdAt: "2026-01-01",
};
afterEach(() => {
	cleanup();
	localStorage.clear();
	vi.resetAllMocks();
});

function setup() {
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	const wrapper = ({ children }: { children: ReactNode }) => (
		<QueryClientProvider client={client}>
			<AuthProvider>{children}</AuthProvider>
		</QueryClientProvider>
	);
	return { client, ...renderHook(() => useAuth(), { wrapper }) };
}

describe("session lifecycle", () => {
	it("clears cached account data on logout and rejects late session restoration", async () => {
		let resolveUser!: (value: User) => void;
		api.fetchCurrentUser.mockReturnValue(
			new Promise<User>((resolve) => {
				resolveUser = resolve;
			}),
		);
		const { client, result } = setup();
		client.setQueryData(["ownReview", "CC1000", 1], { id: 99 });
		client.setQueryData(["adminReviews"], { private: true });
		act(() => result.current.logout());
		await act(async () => {
			resolveUser(user);
			await Promise.resolve();
		});
		expect(result.current.user).toBeNull();
		expect(client.getQueryCache().getAll()).toHaveLength(0);
	});
	it("clears prior account data when another account logs in", async () => {
		api.fetchCurrentUser.mockResolvedValue(user);
		api.loginWithPassword.mockResolvedValue({ ...user, id: 2 });
		const { client, result } = setup();
		await waitFor(() => expect(result.current.user?.id).toBe(1));
		client.setQueryData(["adminReviews"], { private: true });
		await act(() =>
			result.current.login({ username: "other", password: "test" }),
		);
		expect(result.current.user?.id).toBe(2);
		expect(client.getQueryCache().getAll()).toHaveLength(0);
	});
	it("clears the session and caches on expiry", async () => {
		api.fetchCurrentUser.mockResolvedValue(user);
		const { client, result } = setup();
		await waitFor(() => expect(result.current.isAuthenticated).toBe(true));
		localStorage.setItem("ramitos-token", "expired");
		client.setQueryData(["adminReviews"], { private: true });
		act(() => {
			window.dispatchEvent(new Event("ramitos-session-expired"));
		});
		expect(result.current.isAuthenticated).toBe(false);
		expect(localStorage.getItem("ramitos-token")).toBeNull();
		expect(client.getQueryCache().getAll()).toHaveLength(0);
	});
});
