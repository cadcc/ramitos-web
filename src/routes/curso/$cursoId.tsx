import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { CourseDetailPage } from "../../features/course-detail";

const searchSchema = z.object({
	reviewSort: z.enum(["newest", "top"]).optional().default("newest"),
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
