// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { Ordering } from "../api/adminReviews.api";
import { getAdminReviewsPage } from "../api/adminReviews.api";
import { useAdminReviews } from "./useAdminReviews";
vi.mock("../api/adminReviews.api", () => ({
	getAdminReviewsPage: vi.fn(),
	Ordering: { asc: "asc", desc: "desc" },
}));
afterEach(cleanup);

it("navigates cursor pages and resets to the first page on size or order changes", async () => {
	const request = vi.mocked(getAdminReviewsPage);
	request.mockImplementation((cursor) =>
		Promise.resolve({
			items: [],
			nextCursor: cursor === undefined ? 42 : null,
		}),
	);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false, staleTime: Infinity } },
	});
	const { result } = renderHook(() => useAdminReviews(), {
		wrapper: ({ children }: { children: ReactNode }) => (
			<QueryClientProvider client={client}>{children}</QueryClientProvider>
		),
	});
	await waitFor(() => expect(result.current.hasNextPage).toBe(true));
	expect(request).toHaveBeenLastCalledWith(undefined, 15, Ordering.desc);
	act(() => result.current.nextPage());
	await waitFor(() => expect(result.current.reviewsQuery.isSuccess).toBe(true));
	expect(result.current.page).toBe(2);
	expect(request).toHaveBeenLastCalledWith(42, 15, Ordering.desc);
	expect(result.current.hasNextPage).toBe(false);
	act(() => result.current.previousPage());
	expect(result.current.page).toBe(1);
	act(() => result.current.nextPage());
	expect(result.current.page).toBe(2);
	act(() => result.current.setCreatedOrder(Ordering.asc));
	await waitFor(() => expect(result.current.hasNextPage).toBe(true));
	expect(result.current.page).toBe(1);
	expect(request).toHaveBeenLastCalledWith(undefined, 15, Ordering.asc);
	act(() => result.current.nextPage());
	await waitFor(() => expect(result.current.reviewsQuery.isSuccess).toBe(true));
	act(() => result.current.setPageSize(50));
	await waitFor(() => expect(result.current.hasNextPage).toBe(true));
	expect(result.current.page).toBe(1);
	expect(request).toHaveBeenLastCalledWith(undefined, 50, Ordering.asc);
	client.clear();
});
