// @vitest-environment jsdom
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { afterEach, expect, it, vi } from "vitest";
import type { Review } from "../../../shared/types/domain";
import { getCourseReviewsPage } from "../api/courseReviews.api";
import { useCourseReviews } from "./useCourseReviews";
vi.mock("../api/courseReviews.api", () => ({ getCourseReviewsPage: vi.fn() }));
vi.mock("../../../shared/hooks/useInfiniteScroll", () => ({
	useInfiniteScroll: () => ({ current: null }),
}));
afterEach(() => {
	cleanup();
	vi.clearAllMocks();
});
const item = (id: number) => ({ id }) as Review;
function setup(reviewId?: number) {
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	return renderHook(() => useCourseReviews("CC1000", "newest", reviewId), {
		wrapper: ({ children }: { children: ReactNode }) => (
			<QueryClientProvider client={client}>{children}</QueryClientProvider>
		),
	});
}
it("loads later public pages until the linked review is found and stops", async () => {
	const request = vi.mocked(getCourseReviewsPage);
	request
		.mockResolvedValueOnce({ items: [item(30)], nextCursor: 30, total: 1 })
		.mockResolvedValueOnce({ items: [item(20)], nextCursor: 20, total: 1 });
	const { result } = setup(20);
	await waitFor(() => expect(result.current.targetFound).toBe(true));
	expect(request).toHaveBeenCalledTimes(2);
	expect(request).toHaveBeenLastCalledWith("CC1000", "newest", 30);
});
it("stops at the end when the linked review is missing", async () => {
	const request = vi.mocked(getCourseReviewsPage);
	request.mockResolvedValue({ items: [item(30)], nextCursor: null, total: 1 });
	const { result } = setup(20);
	await waitFor(() => expect(result.current.reviewsQuery.isSuccess).toBe(true));
	expect(result.current.targetFound).toBe(false);
	expect(result.current.reviewsQuery.hasNextPage).toBe(false);
	expect(request).toHaveBeenCalledTimes(1);
});
it("does not scan pages without a review link", async () => {
	const request = vi.mocked(getCourseReviewsPage);
	request.mockResolvedValue({ items: [item(30)], nextCursor: 30, total: 1 });
	const { result } = setup();
	await waitFor(() => expect(result.current.reviewsQuery.isSuccess).toBe(true));
	expect(request).toHaveBeenCalledTimes(1);
});
it("stops on a later-page error instead of treating the target as missing", async () => {
	const request = vi.mocked(getCourseReviewsPage);
	request
		.mockResolvedValueOnce({ items: [item(30)], nextCursor: 30, total: 1 })
		.mockRejectedValue(new Error("offline"));
	const { result } = setup(20);
	await waitFor(() =>
		expect(result.current.reviewsQuery.isFetchNextPageError).toBe(true),
	);
	expect(request).toHaveBeenCalledTimes(2);
});
