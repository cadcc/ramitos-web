import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { DEFAULT_REVIEW_SORT } from "../../constants/reviews";
import { CourseDetailPage } from "../../features/course-detail";

const searchSchema = z.object({
	reviewId: z.coerce
		.number()
		.int()
		.positive()
		.max(2147483647)
		.optional()
		.catch(undefined),
	reviewSort: z.enum(["newest", "top"]).optional().default(DEFAULT_REVIEW_SORT),
});

export const Route = createFileRoute("/curso/$cursoId")({
	validateSearch: searchSchema,
	component: CourseDetailRoute,
});

function CourseDetailRoute() {
	const { cursoId } = Route.useParams();
	const { reviewSort, reviewId } = Route.useSearch();

	return (
		<CourseDetailPage
			cursoId={cursoId}
			reviewSort={reviewSort}
			reviewId={reviewId}
		/>
	);
}
