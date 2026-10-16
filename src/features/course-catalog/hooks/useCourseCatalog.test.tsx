// @vitest-environment jsdom
import { renderHook, waitFor, cleanup } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import type * as CatalogApi from "../api/courseCatalog.api";
import { useCourseCatalog } from "./useCourseCatalog";
import { getReviewableCourses } from "../api/reviewableCourses.api";

const auth = vi.hoisted(() => ({ user: { id: 1 }, isAuthenticated: true }));
vi.mock("../../auth", () => ({ useAuth: () => auth }));
vi.mock("../../../generated/api/course/courseService", () => ({
	listCourses: vi.fn().mockResolvedValue({ data: [] }),
}));
vi.mock("../api/reviewableCourses.api", () => ({
	getReviewableCourses: vi.fn(),
}));
vi.mock("../api/courseCatalog.api", async (original) => ({
	...(await original<typeof CatalogApi>()),
	getCourseCatalogIndex: () =>
		Promise.resolve({
			items: [
				{ id: "CC3000", name: "One", categoryTags: [] },
				{ id: "CC3001", name: "Two", categoryTags: [] },
			],
			categoryOptions: [],
			total: 2,
		}),
}));
afterEach(() => {
	cleanup();
	auth.user.id = 1;
	auth.isAuthenticated = true;
	vi.mocked(getReviewableCourses).mockReset();
});
const course = (id: string) => ({
	id,
	name: id,
	stats: {},
	tag_stats: {},
	reviewCount: 0,
	commentReviewCount: 0,
	reviewable: true,
});
function wrapper() {
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	return ({ children }: { children: ReactNode }) => (
		<QueryClientProvider client={client}>{children}</QueryClientProvider>
	);
}
it("uses only reviewable courses and switches the data when the account changes", async () => {
	vi.mocked(getReviewableCourses)
		.mockResolvedValueOnce([course("CC3000")])
		.mockResolvedValueOnce([course("CC3001")]);
	const view = renderHook(() => useCourseCatalog({ reviewable: true }), {
		wrapper: wrapper(),
	});
	await waitFor(() =>
		expect(view.result.current.pagesQuery.data?.pages[0]?.items[0]?.id).toBe(
			"CC3000",
		),
	);
	auth.user.id = 2;
	view.rerender();
	expect(view.result.current.pagesQuery.data).toBeUndefined();
	await waitFor(() =>
		expect(view.result.current.pagesQuery.data?.pages[0]?.items[0]?.id).toBe(
			"CC3001",
		),
	);
});
it("does not request personal data when signed out", async () => {
	auth.isAuthenticated = false;
	const view = renderHook(() => useCourseCatalog({ reviewable: true }), {
		wrapper: wrapper(),
	});
	await waitFor(() =>
		expect(view.result.current.indexQuery.isSuccess).toBe(true),
	);
	expect(view.result.current.requiresLogin).toBe(true);
	expect(getReviewableCourses).not.toHaveBeenCalled();
});

it("keeps the two personal scopes separate when switching filters", async () => {
	vi.mocked(getReviewableCourses)
		.mockResolvedValueOnce([course("CC3000")])
		.mockResolvedValueOnce([{ ...course("CC3001"), reviewable: false }]);
	const view = renderHook(
		({ reviewable }) => useCourseCatalog({ reviewable }),
		{ wrapper: wrapper(), initialProps: { reviewable: true } },
	);
	await waitFor(() =>
		expect(view.result.current.pagesQuery.data?.pages[0]?.items[0]?.id).toBe(
			"CC3000",
		),
	);
	view.rerender({ reviewable: false });
	expect(view.result.current.pagesQuery.data).toBeUndefined();
	await waitFor(() =>
		expect(view.result.current.pagesQuery.data?.pages[0]?.items[0]?.id).toBe(
			"CC3001",
		),
	);
	expect(getReviewableCourses).toHaveBeenLastCalledWith(false);
});

it("marks reviewable courses in the public catalog and clears markers on sign-out", async () => {
	vi.mocked(getReviewableCourses).mockResolvedValue([course("CC3000")]);
	const view = renderHook(() => useCourseCatalog({}), { wrapper: wrapper() });
	await waitFor(() =>
		expect([...view.result.current.reviewableCourseIds]).toEqual(["CC3000"]),
	);
	expect(view.result.current.filteredTotal).toBe(2);
	expect(getReviewableCourses).toHaveBeenCalledWith(true);
	auth.isAuthenticated = false;
	view.rerender();
	expect(view.result.current.reviewableCourseIds.size).toBe(0);
});

it("suppresses indicators in the reviewable-only filter", async () => {
	vi.mocked(getReviewableCourses).mockResolvedValue([course("CC3000")]);
	const view = renderHook(() => useCourseCatalog({ reviewable: true }), {
		wrapper: wrapper(),
	});
	await waitFor(() =>
		expect(view.result.current.reviewableQuery.isSuccess).toBe(true),
	);
	expect(view.result.current.reviewableCourseIds.size).toBe(0);
});
