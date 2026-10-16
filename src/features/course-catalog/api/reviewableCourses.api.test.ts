import { expect, it, vi } from "vitest";
import { listCourses } from "../../../generated/api/course/courseService";
import { getReviewableCourses } from "./reviewableCourses.api";

vi.mock("../../auth", () => ({
	session: {
		authenticated: (request: (headers: Record<string, string>) => unknown) =>
			request({ Authorization: "Bearer test" }),
	},
}));
vi.mock("../../../generated/api/course/courseService", () => ({
	listCourses: vi.fn(),
}));

it("authenticates and follows the cursor beyond the first 50 reviewable courses", async () => {
	const courses = Array.from({ length: 51 }, (_, i) => ({
		id: `CC${1000 + i}`,
		name: "Curso",
		stats: {},
		tag_stats: {},
		reviewCount: 0,
		reviewable: true,
	}));
	vi.mocked(listCourses)
		.mockResolvedValueOnce({
			status: 200,
			data: courses.slice(0, 50),
			headers: new Headers(),
		})
		.mockResolvedValueOnce({
			status: 200,
			data: courses.slice(50),
			headers: new Headers(),
		});
	expect(await getReviewableCourses()).toEqual(courses);
	expect(listCourses).toHaveBeenLastCalledWith(
		{ reviewable: true, limit: 50, after: "CC1049" },
		{ headers: { Authorization: "Bearer test" } },
	);
});

it("requests courses that are not reviewable with an explicit false filter", async () => {
	vi.mocked(listCourses).mockResolvedValueOnce({
		status: 200,
		data: [],
		headers: new Headers(),
	});
	expect(await getReviewableCourses(false)).toEqual([]);
	expect(listCourses).toHaveBeenLastCalledWith(
		{ reviewable: false, limit: 50, after: undefined },
		{ headers: { Authorization: "Bearer test" } },
	);
});
