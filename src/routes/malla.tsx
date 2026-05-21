import { createFileRoute } from "@tanstack/react-router";
import { CourseRoadmapPage } from "../features/course-roadmap";

export const Route = createFileRoute("/malla")({
	component: MallaRoute,
});

function MallaRoute() {
	return <CourseRoadmapPage degree="dcc" />;
}
