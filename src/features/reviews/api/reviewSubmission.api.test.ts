// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { submitCourseReview } from "./reviewSubmission.api";
import type { ReviewSubmission } from "../../../shared/types/domain";

const submission: ReviewSubmission = {
	cursoId: "CC1000",
	year: 2026,
	semester: 1,
	comment: "  Buen curso  ",
	tags: [],
	ratings: { carga: 3, dificultad: 3, docencia: 4, relevancia: 4, vibes: 5 },
};
afterEach(() => {
	vi.unstubAllGlobals();
	localStorage.clear();
});

describe("review submission API boundary", () => {
	it("sends the trimmed comment, ratings and bearer token", async () => {
		localStorage.setItem("ramitos-token", "test-token");
		const fetchMock = vi
			.fn<typeof fetch>()
			.mockResolvedValue(
				new Response(JSON.stringify({ id: 1 }), { status: 200 }),
			);
		vi.stubGlobal("fetch", fetchMock);
		await expect(submitCourseReview(submission)).resolves.toEqual({ id: 1 });
		const options = fetchMock.mock.calls[0]?.[1];
		expect(new Headers(options?.headers).get("Authorization")).toBe(
			"Bearer test-token",
		);
		if (typeof options?.body !== "string")
			throw new Error("Expected JSON request body");
		expect(JSON.parse(options.body)).toMatchObject({
			course_code: "CC1000",
			comments: "Buen curso",
			stats: submission.ratings,
		});
	});
	it.each([401, 422, 500])(
		"rejects HTTP %s instead of reporting success",
		async (status) => {
			vi.stubGlobal(
				"fetch",
				vi.fn().mockResolvedValue(new Response("{}", { status })),
			);
			const expired = vi.fn();
			window.addEventListener("ramitos-session-expired", expired);
			try {
				await expect(submitCourseReview(submission)).rejects.toThrow();
				expect(expired).toHaveBeenCalledTimes(status === 401 ? 1 : 0);
			} finally {
				window.removeEventListener("ramitos-session-expired", expired);
			}
		},
	);
	it("propagates a network failure", async () => {
		vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));
		await expect(submitCourseReview(submission)).rejects.toThrow("offline");
	});
});
