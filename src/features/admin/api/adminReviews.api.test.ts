// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
vi.mock("../../auth", () => ({
	session: {
		authenticated: <T>(request: (headers: HeadersInit) => Promise<T>) =>
			request({ Authorization: "Bearer test-token" }),
	},
}));
import { getAdminReviewsPage } from "./adminReviews.api";
import { Ordering } from "../../../generated/api/review/models";

const review = (id: number, code = "CC1000") => ({
	id,
	course_code: code,
	account_id: 1,
	stats: {},
	tags: [],
	comments: "Buen curso",
	created_at: "2026-10-01T00:00:00Z",
});
afterEach(() => vi.unstubAllGlobals());

it("authenticates and preserves server order, cursor and limit while joining real course names", async () => {
	const fetchMock = vi
		.fn<typeof fetch>()
		.mockResolvedValueOnce(
			new Response(
				JSON.stringify([review(4), review(3), review(2, "CC2000")]),
				{ status: 200 },
			),
		)
		.mockResolvedValueOnce(
			new Response(
				JSON.stringify([
					{ id: "CC2000", name: "Algoritmos" },
					{ id: "CC1000", name: "Programación" },
				]),
				{ status: 200 },
			),
		);
	vi.stubGlobal("fetch", fetchMock);
	const result = await getAdminReviewsPage(5, 3, Ordering.asc);
	const url = new URL(
		fetchMock.mock.calls[0]![0] as string,
		"http://localhost",
	);
	expect(Object.fromEntries(url.searchParams)).toEqual({
		limit: "3",
		after: "5",
		created_order: "asc",
	});
	expect(
		new Headers(fetchMock.mock.calls[0]![1]?.headers).get("Authorization"),
	).toBe("Bearer test-token");
	expect(result.items.map((item) => [item.id, item.courseName])).toEqual([
		[4, "CC1000 - Programación"],
		[3, "CC1000 - Programación"],
		[2, "CC2000 - Algoritmos"],
	]);
	expect(result.nextCursor).toBe(2);
	const coursesUrl = new URL(
		fetchMock.mock.calls[1]![0] as string,
		"http://localhost",
	);
	expect(coursesUrl.searchParams.getAll("codes")).toEqual(["CC1000", "CC2000"]);
});
it("defaults to descending and uses the course code when metadata is missing", async () => {
	const fetchMock = vi
		.fn<typeof fetch>()
		.mockResolvedValueOnce(new Response(JSON.stringify([review(1)])))
		.mockResolvedValueOnce(new Response("[]"));
	vi.stubGlobal("fetch", fetchMock);
	const result = await getAdminReviewsPage();
	expect(fetchMock.mock.calls[0]![0] as string).toContain("created_order=desc");
	expect(result.items[0]!.courseName).toBe("CC1000");
	expect(result.nextCursor).toBeNull();
});
it("does not request courses for an empty page", async () => {
	const fetchMock = vi.fn().mockResolvedValue(new Response("[]"));
	vi.stubGlobal("fetch", fetchMock);
	await expect(getAdminReviewsPage()).resolves.toEqual({
		items: [],
		nextCursor: null,
	});
	expect(fetchMock).toHaveBeenCalledTimes(1);
});
it.each([401, 500])("rejects review HTTP %s failures", async (status) => {
	vi.stubGlobal(
		"fetch",
		vi.fn().mockResolvedValue(new Response("{}", { status })),
	);
	await expect(getAdminReviewsPage()).rejects.toThrow();
});
it("rejects course lookup failures", async () => {
	vi.stubGlobal(
		"fetch",
		vi
			.fn()
			.mockResolvedValueOnce(new Response(JSON.stringify([review(1)])))
			.mockResolvedValueOnce(new Response("{}", { status: 500 })),
	);
	await expect(getAdminReviewsPage()).rejects.toThrow(
		"Unable to load review courses",
	);
});
