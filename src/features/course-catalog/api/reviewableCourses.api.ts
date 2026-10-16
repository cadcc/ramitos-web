import { session } from "../../auth";
import { listCourses } from "../../../generated/api/course/courseService";
import type { Course } from "../../../generated/api/course/models";

export async function getReviewableCourses(
	reviewable = true,
): Promise<Course[]> {
	const courses: Course[] = [];
	const cursors = new Set<string>();
	let after: string | undefined;
	for (;;) {
		const response = await session.authenticated((headers) =>
			listCourses({ reviewable, limit: 50, after }, { headers }),
		);
		if (response.status !== 200)
			throw new Error("Unable to load reviewable courses");
		courses.push(...response.data);
		if (response.data.length < 50) return courses;
		after = response.data[response.data.length - 1]!.id;
		if (cursors.has(after))
			throw new Error("Course pagination did not advance");
		cursors.add(after);
	}
}
