import { expect, it, vi } from "vitest";
import { getCourse } from "../../../generated/api/course/courseService";
import { getCourseDetail } from "./courseDetail.api";
import combinedCourses from "../../../../data/courses/combined.json";
import tags from "../../../../data/courses/tags.json";

vi.mock("../../auth", () => ({
	session: {
		authenticated: (request: (headers: Record<string, string>) => unknown) =>
			request({ Authorization: "Bearer test" }),
	},
}));
vi.mock("../../../generated/api/course/courseService", () => ({
	getCourse: vi.fn(),
}));

it("loads authenticated eligibility and preserves a false reviewable value", async () => {
	vi.mocked(getCourse).mockResolvedValueOnce({
		status: 200,
		data: {
			id: "CC1000",
			name: "Curso",
			stats: {},
			tag_stats: {},
			reviewCount: 42,
			commentReviewCount: 17,
			enrolled: false,
			reviewable: false,
		},
		headers: new Headers(),
	});
	expect(await getCourseDetail("CC1000", true)).toMatchObject({
		reviewCount: 42,
		commentReviewCount: 17,
		enrolled: false,
		reviewable: false,
		description: combinedCourses.find((course) => course.codigo === "CC1000")
			?.resumen,
		syllabusUrl: combinedCourses.find((course) => course.codigo === "CC1000")
			?.plan,
		acmUnits: combinedCourses.find((course) => course.codigo === "CC1000")?.acm,
		categoryTags: [10, 11, 2, 39, 41].map(
			(id) => tags.find((tag) => tag.id === id)?.name,
		),
	});
	expect(getCourse).toHaveBeenLastCalledWith("CC1000", {
		headers: { Authorization: "Bearer test" },
	});
});

it("shows an honest empty state when local course metadata is missing", async () => {
	vi.mocked(getCourse).mockResolvedValueOnce({
		status: 200,
		data: {
			id: "UNKNOWN",
			name: "Curso sin datos locales",
			stats: {},
			tag_stats: { Programacion: { value: 1 } },
			reviewCount: 1,
			commentReviewCount: 0,
		},
		headers: new Headers(),
	});
	expect(await getCourseDetail("UNKNOWN")).toMatchObject({
		description: "Resumen no disponible.",
		syllabusUrl: undefined,
		categoryTags: [],
		acmUnits: [],
	});
});

it("keeps missing eligibility unknown on a public request", async () => {
	vi.mocked(getCourse).mockResolvedValueOnce({
		status: 200,
		data: {
			id: "CC1000",
			name: "Curso",
			stats: {},
			tag_stats: {},
			reviewCount: 0,
			commentReviewCount: 0,
		},
		headers: new Headers(),
	});
	expect((await getCourseDetail("CC1000"))?.reviewable).toBeUndefined();
	expect(getCourse).toHaveBeenLastCalledWith("CC1000");
});
