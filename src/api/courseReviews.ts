import { faker } from "@faker-js/faker";
import { listCourseReviews } from "./anonymous-review/anonymousReviewService";
import type { AnonymousReview } from "./anonymous-review/models";
import { getAuthHeaders, handleAuthenticatedResponse } from "./auth";
import { listReviews } from "./review/reviewService";
import type { Review as AuthenticatedReview } from "./review/models";
import type { CourseRatings, Review, ReviewSort } from "./types";

const PAGE_SIZE = 10;

export interface CourseReviewsPage {
	items: Review[];
	nextCursor: number | null;
	total: number;
}

function hashReview(courseId: string, reviewId: number): number {
	let hash = reviewId || 1;
	for (const char of courseId) {
		hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
	}
	return hash || 1;
}

function withReviewSeed<T>(
	courseId: string,
	reviewId: number,
	offset: number,
	fn: () => T,
): T {
	faker.seed(hashReview(courseId, reviewId) + offset);
	return fn();
}

function ratingValue(value: number | undefined): number {
	return Math.max(0, Math.min(5, value ?? 0));
}

function toRatings(review: { stats: AnonymousReview["stats"] }): CourseRatings {
	return {
		carga: ratingValue(review.stats.carga),
		dificultad: ratingValue(review.stats.dificultad),
		docencia: ratingValue(review.stats.docencia),
		relevancia: ratingValue(review.stats.relevancia),
		vibes: ratingValue(review.stats.vibes),
	};
}

function fallbackTerm(courseId: string, reviewId: number) {
	// TODO(backend): Replace with the term when the reviewed course was taken.
	return withReviewSeed(courseId, reviewId, 100, () => ({
		year: faker.number.int({ min: 2022, max: 2026 }),
		semester: faker.helpers.arrayElement([1, 2] as const),
	}));
}

function fallbackReactionCounts(courseId: string, reviewId: number) {
	// TODO(backend): Replace with persisted review reaction counts.
	return withReviewSeed(courseId, reviewId, 200, () => ({
		likes: faker.number.int({ min: 0, max: 28 }),
		dislikes: faker.number.int({ min: 0, max: 6 }),
		funny: faker.number.int({ min: 0, max: 10 }),
	}));
}

function toReview(courseId: string, review: AnonymousReview): Review {
	const term = fallbackTerm(courseId, review.id);
	const reactions = fallbackReactionCounts(courseId, review.id);

	return {
		id: review.id,
		cursoId: courseId,
		year: term.year,
		semester: term.semester,
		comment: review.comments,
		ratings: toRatings(review),
		tags: review.tags,
		...reactions,
		// TODO(backend): Replace with moderation status once exposed on reviews.
		hidden: false,
		createdAt: review.created_at,
	};
}

export function authenticatedReviewToReview(
	courseId: string,
	review: AuthenticatedReview,
): Review {
	const term = fallbackTerm(courseId, review.id);
	const reactions = fallbackReactionCounts(courseId, review.id);

	return {
		id: review.id,
		cursoId: courseId,
		year: term.year,
		semester: term.semester,
		comment: review.comments ?? "",
		ratings: toRatings(review),
		tags: review.tags,
		...reactions,
		// TODO(backend): Replace with moderation status once exposed on reviews.
		hidden: false,
		createdAt: review.created_at,
	};
}

function sortLoadedReviews(reviews: Review[], sort: ReviewSort): Review[] {
	if (sort === "top") {
		// TODO(backend): Replace with server-side top ordering once reaction counts are real.
		return [...reviews].sort((a, b) => b.likes - b.dislikes - (a.likes - a.dislikes));
	}

	return [...reviews].sort(
		(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
	);
}

export async function getCourseReviewsPage(
	courseId: string,
	sort: ReviewSort,
	cursor?: number,
): Promise<CourseReviewsPage> {
	let response: Awaited<ReturnType<typeof listCourseReviews>>;
	try {
		response = await listCourseReviews(courseId, {
			limit: PAGE_SIZE,
			after: cursor,
		});
	} catch {
		// TODO(backend): Return an empty review list instead of a failed response when a course has no public reviews.
		return { items: [], nextCursor: null, total: 0 };
	}

	if ((response as { status: number }).status >= 400 || !Array.isArray(response.data)) {
		// TODO(backend): Return a typed review array for every successful public review-list request.
		return { items: [], nextCursor: null, total: 0 };
	}

	const items = sortLoadedReviews(
		response.data.map((review) => toReview(courseId, review)),
		sort,
	);

	return {
		items,
		// TODO(backend): Replace inferred cursor with explicit review pagination metadata.
		nextCursor:
			response.data.length === PAGE_SIZE
				? (response.data[response.data.length - 1]?.id ?? null)
				: null,
		// TODO(backend): Replace loaded-page count with explicit total review count.
		total: response.data.length,
	};
}

export async function getOwnCourseReview(
	courseId: string,
	accountId: number,
): Promise<Review | null> {
	const response = await listReviews(
		{ course_id: courseId, account_id: accountId, limit: 1 },
		{ headers: getAuthHeaders() },
	);
	if (handleAuthenticatedResponse((response as { status: number }).status)) {
		return null;
	}
	if ((response as { status: number }).status >= 400) return null;
	const review = response.data[0];
	return review ? authenticatedReviewToReview(courseId, review) : null;
}
