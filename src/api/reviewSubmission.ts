import { getAuthHeaders } from "./auth";
import { createReview } from "./review/reviewService";
import type { CreateReviewResponseContent } from "./review/models";
import type { ReviewSubmission } from "./types";

export async function submitCourseReview(
	submission: ReviewSubmission,
): Promise<CreateReviewResponseContent> {
	const response = await createReview(
		{
			course_code: submission.cursoId,
			comments: submission.comment.trim() || undefined,
			stats: submission.ratings,
			tags: submission.tags,
		},
		{ headers: getAuthHeaders() },
	);

	if ((response as { status: number }).status >= 400) {
		throw new Error("Review submission failed");
	}

	return response.data;
}
