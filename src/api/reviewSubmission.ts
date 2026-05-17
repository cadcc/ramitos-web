import { getAuthHeaders, handleAuthenticatedResponse } from "./auth";
import { createReview } from "./review/reviewService";
import type { CreateReviewResponseContent, DuplicatedEntityResponseContent } from "./review/models";
import type { ReviewSubmission } from "./types";

export async function submitCourseReview(
	submission: ReviewSubmission,
): Promise<CreateReviewResponseContent | DuplicatedEntityResponseContent> {
	const response = await createReview(
		{
			course_code: submission.cursoId,
			comments: submission.comment.trim() || undefined,
			stats: submission.ratings,
			tags: submission.tags,
		},
		{ headers: getAuthHeaders() },
	);

	if (handleAuthenticatedResponse((response as { status: number }).status)) {
		throw new Error("Session expired");
	}
	if ((response as { status: number }).status >= 400) {
		throw new Error("Review submission failed");
	}

	return response.data;
}
