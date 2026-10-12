// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
vi.mock("../../auth", () => ({ session: {} }));
import { getCourseReviewsPage } from "./courseReviews.api";
afterEach(() => vi.unstubAllGlobals());
it("treats a missing public review list as empty", async () => {
	vi.stubGlobal(
		"fetch",
		vi.fn().mockResolvedValue(new Response(null, { status: 404 })),
	);
	await expect(getCourseReviewsPage("CC1000", "newest")).resolves.toEqual({
		items: [],
		nextCursor: null,
		total: 0,
	});
});
it.each([401, 500])(
	"preserves HTTP %s errors so permalink searches can be retried",
	async (status) => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue(new Response("{}", { status })),
		);
		await expect(
			getCourseReviewsPage("CC1000", "newest", 42),
		).rejects.toThrow();
	},
);
it("preserves network failures instead of marking the linked review unavailable", async () => {
	vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));
	await expect(getCourseReviewsPage("CC1000", "newest", 42)).rejects.toThrow(
		"offline",
	);
});
