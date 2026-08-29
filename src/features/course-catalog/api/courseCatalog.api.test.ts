import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Course } from "../../../generated/api/course/models";
import {
	filterCourseCatalog,
	getCourseCatalogPage,
	normalizeCourseCatalog,
	toCourseCatalogItem,
} from "./courseCatalog.api";

const { listCoursesMock } = vi.hoisted(() => ({
	listCoursesMock: vi.fn(),
}));

vi.mock("../../../generated/api/course/courseService", () => ({
	listCourses: listCoursesMock,
}));

const dynamicCourse: Course = {
	id: "CC1000",
	name: "Herramientas Computacionales",
	stats: {
		docencia: { value: 4.4 },
		carga: { value: 7 },
	},
	tag_stats: { Programacion: { value: 10 } },
};

describe("course catalog API adapter", () => {
	beforeEach(() => listCoursesMock.mockReset());

	it("normalizes the complete static index and resolves category indexes", () => {
		const result = normalizeCourseCatalog({
			count: 2,
			categories: ["Programacion", "Sistemas"],
			courses: [
				{ code: "CC1000", name: "Herramientas", categories: [0, 1] },
				{ code: "CC2000", name: "Sistemas", categories: [1] },
			],
		});

		expect(result.total).toBe(2);
		expect(result.items[0]).toEqual({
			id: "CC1000",
			name: "Herramientas",
			categoryTags: ["Programacion", "Sistemas"],
		});
	});

	it("filters the static index before dynamic pages are requested", () => {
		const entries = [
			{ id: "CC1000", name: "Programacion", categoryTags: ["Software"] },
			{ id: "CC3000", name: "Sistemas", categoryTags: ["Sistemas"] },
		];

		expect(filterCourseCatalog(entries, { q: "cc3000" })).toEqual([entries[1]]);
		expect(filterCourseCatalog(entries, { tags: ["Software"] })).toEqual([
			entries[0],
		]);
	});

	it("requests dynamic data by code and preserves static result order", async () => {
		listCoursesMock.mockResolvedValue({
			data: [
				{ ...dynamicCourse, id: "CC2000", name: "Backend order" },
				dynamicCourse,
			],
		});
		const entries = [
			{ id: "CC1000", name: "Static A", categoryTags: [] },
			{ id: "CC2000", name: "Static B", categoryTags: [] },
		];

		const result = await getCourseCatalogPage(entries);

		expect(listCoursesMock).toHaveBeenCalledWith({
			codes: ["CC1000", "CC2000"],
		});
		expect(result.items.map((course) => course.id)).toEqual([
			"CC1000",
			"CC2000",
		]);
	});

	it("keeps static courses when dynamic statistics are missing", () => {
		const result = toCourseCatalogItem({
			id: "CC9999",
			name: "Curso sin opiniones",
			categoryTags: ["Teoria"],
		});

		expect(result.name).toBe("Curso sin opiniones");
		expect(result.ratings.docencia).toBe(0);
		expect(
			toCourseCatalogItem(
				{ id: "CC1000", name: "A", categoryTags: [] },
				dynamicCourse,
			).ratings.carga,
		).toBe(5);
	});
});
