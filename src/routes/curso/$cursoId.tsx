import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { DEFAULT_REVIEW_SORT } from "../../constants/reviews";
import { CourseDetailPage } from "../../features/course-detail";

const searchSchema = z.object({
	reviewSort: z.enum(["newest", "top"]).optional().default(DEFAULT_REVIEW_SORT),
});

export const Route = createFileRoute("/curso/$cursoId")({
	validateSearch: searchSchema,
	component: CourseDetailRoute,
});

function CourseDetailRoute() {
	const { cursoId } = Route.useParams();
	const { reviewSort } = Route.useSearch();

	return <CourseDetailPage cursoId={cursoId} reviewSort={reviewSort} />;
}
