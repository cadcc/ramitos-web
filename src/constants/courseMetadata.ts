import tags from "../../data/courses/tags.json";
import combinedCourses from "../../data/courses/combined.json";

const tagNames = new Map(tags.map((tag) => [tag.id, tag.name]));
const coursesByCode = new Map(
	combinedCourses.map((course) => [
		course.codigo,
		{
			summary: course.resumen,
			categories: course.tags
				.map((id) => tagNames.get(id))
				.filter((name): name is string => name !== undefined),
		},
	]),
);

export const COURSE_TOPIC_OPTIONS = tags
	.map((tag) => tag.name)
	.sort((a, b) => a.localeCompare(b, "es"));

export function getCourseMetadata(code: string) {
	return coursesByCode.get(code);
}
