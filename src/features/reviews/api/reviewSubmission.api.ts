import { getAuthHeaders, handleAuthenticatedResponse } from "../../auth";
import { createReview } from "../../../generated/api/review/reviewService";
import type { CreateReviewResponseContent } from "../../../generated/api/review/models";
import type { ReviewSubmission } from "../../../shared/types/domain";

export async function submitCourseReview(
	submission: ReviewSubmission,
): Promise<CreateReviewResponseContent> {
	// TODO(backend): Once review create/update accepts the full form model, replace this adapter with the generated useCreateReview/update-review hook.
	const response = await createReview(
		{
			course_code: submission.cursoId,
			comments: submission.comment.trim() || undefined,
			stats: submission.ratings,
			tags: submission.tags,
		},
		{ headers: getAuthHeaders() },
	);

	if (handleAuthenticatedResponse(response.status)) {
		throw new Error("Session expired");
	}
	if (response.status !== 200) {
		throw new Error("Review submission failed");
	}

	return response.data;
}
