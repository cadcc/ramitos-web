import { listCourses } from "../../../generated/api/course/courseService";
import { listReviews } from "../../../generated/api/review/reviewService";
import { Ordering } from "../../../generated/api/review/models";
import type { Review } from "../../../shared/types/domain";
import { authenticatedReviewToReview } from "../../reviews";
import { session } from "../../auth";

export { Ordering } from "../../../generated/api/review/models";

export interface AdminReview extends Review {
	courseName: string;
	accountId: number;
}

export interface AdminReviewsPage {
	items: AdminReview[];
	nextCursor: number | null;
}

export async function getAdminReviewsPage(
	cursor?: number,
	pageSize = 15,
	createdOrder: Ordering = Ordering.desc,
): Promise<AdminReviewsPage> {
	const response = await session.authenticated((headers) =>
		listReviews(
			{ limit: pageSize, after: cursor, created_order: createdOrder },
			{ headers },
		),
	);
	if (response.status !== 200 || !Array.isArray(response.data)) {
		throw new Error("Unable to load admin reviews");
	}
	if (response.data.length === 0) return { items: [], nextCursor: null };

	const codes = [...new Set(response.data.map((review) => review.course_code))];
	const courses = await listCourses({ codes, limit: codes.length });
	if (courses.status !== 200 || !Array.isArray(courses.data)) {
		throw new Error("Unable to load review courses");
	}
	const courseNames = new Map(
		courses.data.map((course) => [course.id, course.name]),
	);
	return {
		items: response.data.map((review) => {
			const name = courseNames.get(review.course_code);
			return {
				...authenticatedReviewToReview(review.course_code, review),
				accountId: review.account_id,
				courseName: name
					? `${review.course_code} - ${name}`
					: review.course_code,
			};
		}),
		// ReviewService exposes no total or next cursor; a full page may have a successor.
		nextCursor:
			response.data.length === pageSize
				? response.data[response.data.length - 1]!.id
				: null,
	};
}
