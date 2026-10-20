import { expect, it, vi } from "vitest";
import {
	ALL_REVIEW_TAGS,
	getCourseSummaryTags,
	toggleReviewTag,
} from "../../../constants/reviewTags";
import {
	mockCreateReview,
	mockGetCourse,
	mockGetCoursesStaticData,
	mockListCourseReviews,
	mockListReviews,
} from "./fixtures";

function info(
	courseId: string,
	body?: object,
): Parameters<typeof mockGetCourse>[0] {
	return {
		request: new Request("http://localhost/api/courses/" + courseId, {
			method: body ? "POST" : "GET",
			...(body ? { body: JSON.stringify(body) } : {}),
		}),
		params: { courseId },
		cookies: {},
		requestId: "fixture-test",
		finalize: vi.fn(),
	};
}

it("populates course summaries from valid review tags while preserving catalog categories", () => {
	const catalog = mockGetCoursesStaticData();
	for (const entry of catalog.courses) {
		const request = info(entry.code);
		const course = mockGetCourse(request);
		const reviews = mockListReviews({
			...request,
			request: new Request(
				`http://localhost/api/reviews?course_id=${entry.code}&limit=50`,
			),
		});
		const counts: Record<string, { value: number }> = {};
		for (const review of reviews) {
			expect(review.tags.length).toBeGreaterThan(0);
			expect(review.tags.every((tag) => ALL_REVIEW_TAGS.includes(tag))).toBe(
				true,
			);
			expect(review.tags.reduce(toggleReviewTag, [] as string[])).toEqual(
				review.tags,
			);
			for (const tag of review.tags) {
				counts[tag] ??= { value: 0 };
				counts[tag].value += 1;
			}
		}
		expect(course.tag_stats).toEqual(counts);
		if (reviews.length)
			expect(getCourseSummaryTags(course.tag_stats).length).toBeGreaterThan(0);
		expect(entry.categories?.length).toBeGreaterThan(0);
		for (const index of entry.categories ?? [])
			expect(catalog.categories[index]).toBeTruthy();
	}
});

it("keeps seeded review ownership unique and course ratings consistent with reviews", () => {
	let ratingsOnlyCount = 0;
	const ids = new Set<number>();
	for (const entry of mockGetCoursesStaticData().courses) {
		const request = info(entry.code);
		const course = mockGetCourse(request);
		const reviews = mockListReviews({
			...request,
			request: new Request(
				`http://localhost/api/reviews?course_id=${entry.code}&limit=50`,
			),
		});
		expect(new Set(reviews.map((r) => r.account_id)).size).toBe(reviews.length);
		for (const review of reviews) {
			expect(ids.has(review.id)).toBe(false);
			ids.add(review.id);
			if (!review.comments?.trim()) ratingsOnlyCount++;
		}
		expect(course.reviewCount).toBe(reviews.length);
		expect(course.commentReviewCount).toBe(
			reviews.filter((r) => r.comments?.trim()).length,
		);
		const comments = mockListCourseReviews(request);
		expect(comments).toHaveLength(course.commentReviewCount);
		expect(comments.every((review) => review.comments.trim())).toBe(true);
		for (const axis of [
			"carga",
			"docencia",
			"dificultad",
			"relevancia",
			"vibes",
		] as const) {
			const ratings = reviews.flatMap((r) =>
				r.stats[axis] === undefined ? [] : [r.stats[axis]],
			);
			if (ratings.length)
				expect(course.stats[axis]?.value).toBeCloseTo(
					ratings.reduce((a, b) => a + b, 0) / ratings.length,
				);
			else expect(course.stats[axis]).toBeUndefined();
		}
	}
	expect(ratingsOnlyCount).toBeGreaterThan(0);
});

it("applies admin ordering before cursor pagination and uses schema page defaults", () => {
	const request = (query: string) => ({
		...info("CC4101"),
		request: new Request(`http://localhost/api/reviews?${query}`),
	});
	const ascending = mockListReviews(request("created_order=asc"));
	expect(ascending).toHaveLength(50);
	expect(ascending.map((r) => r.created_at)).toEqual(
		ascending.map((r) => r.created_at).sort(),
	);
	const first = mockListReviews(request("created_order=asc&limit=3"));
	const next = mockListReviews(
		request(`created_order=asc&limit=3&after=${first[2]!.id}`),
	);
	expect([...first, ...next]).toEqual(ascending.slice(0, 6));
});

it("updates tag counts when a mock review is created or replaced", async () => {
	const courseId = "CC4101";
	const tag = ALL_REVIEW_TAGS[0]!;
	const before = mockGetCourse(info(courseId));
	const beforeCount = before.tag_stats[tag]?.value ?? 0;
	const original = mockListReviews({
		...info(courseId),
		request: new Request(
			`http://localhost/api/reviews?course_id=${courseId}&account_id=1&limit=100`,
		),
	})[0];
	await mockCreateReview(
		info(courseId, {
			course_code: courseId,
			stats: {},
			tags: [tag],
			comments: "Opinión de prueba",
		}),
	);
	const count = mockGetCourse(info(courseId)).tag_stats[tag]?.value ?? 0;
	// Replacing the same account's review must not accumulate duplicate votes.
	await mockCreateReview(
		info(courseId, {
			course_code: courseId,
			stats: {},
			tags: [tag],
			comments: "Opinión actualizada",
		}),
	);
	expect(count).toBe(beforeCount - (original?.tags.includes(tag) ? 1 : 0) + 1);
	expect(mockGetCourse(info(courseId)).tag_stats[tag]?.value).toBe(count);
	const currentReviews = mockListReviews({
		...info(courseId),
		request: new Request(
			`http://localhost/api/reviews?course_id=${courseId}&limit=50`,
		),
	});
	const currentRatings = currentReviews.flatMap((review) =>
		review.stats.docencia === undefined ? [] : [review.stats.docencia],
	);
	expect(mockGetCourse(info(courseId)).stats.docencia?.value).toBeCloseTo(
		currentRatings.reduce((sum, value) => sum + value, 0) /
			currentRatings.length,
	);
});
