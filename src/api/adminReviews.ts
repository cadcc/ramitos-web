import { faker } from "@faker-js/faker";
import { listReviews } from "./review/reviewService";
import { Ordering } from "./review/models";
import type { Review } from "./types";
import { authenticatedReviewToReview } from "./courseReviews";
import { getAuthHeaders, handleAuthenticatedResponse } from "./auth";

const PAGE_SIZE = 15;

export interface AdminReview extends Review {
	courseName: string;
}

export interface AdminReviewsPage {
	items: AdminReview[];
	nextCursor: number | null;
	total: number;
}

function fallbackCourseName(courseCode: string): string {
	// TODO(backend): Replace with course name once the admin feed includes course display metadata.
	faker.seed(
		courseCode.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0),
	);
	return `${courseCode} - ${faker.helpers.arrayElement([
		"Curso DCC",
		"Topicos de Computacion",
		"Taller Aplicado",
		"Seminario de Especialidad",
	])}`;
}

export async function getAdminReviewsPage(
	cursor?: number,
): Promise<AdminReviewsPage> {
	const response = await listReviews(
		{
			limit: PAGE_SIZE,
			after: cursor,
			created_order: Ordering.desc,
		},
		{ headers: getAuthHeaders() },
	);

	if (
		handleAuthenticatedResponse((response as { status: number }).status) ||
		(response as { status: number }).status >= 400 ||
		!Array.isArray(response.data)
	) {
		return { items: [], nextCursor: null, total: 0 };
	}

	const items = response.data.map((review) => ({
		...authenticatedReviewToReview(review.course_code, review),
		courseName: fallbackCourseName(review.course_code),
	}));

	return {
		items,
		nextCursor:
			response.data.length === PAGE_SIZE
				? (response.data[response.data.length - 1]?.id ?? null)
				: null,
		total: response.data.length,
	};
}
