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
	reviewCount: 10,
	commentReviewCount: 0,
	stats: {
		docencia: { value: 4.4 },
		carga: { value: 7 },
	},
	tag_stats: { Programacion: { value: 10 } },
};

describe("course catalog API adapter", () => {
	it("selects bachelor electives by exact code format, threshold, and exclusions", () => {
		const entries = [
			"CC2999",
			"CC3003",
			"CC3000",
			"CC3001",
			"CC5601",
			"CC5622",
			"CC9999",
			"CC7911",
			"CC7912",
			"CC4900",
			"CC4902",
			"CC5900",
			"CC4310",
			"MA3000",
			"CC300",
			"CC30000",
			"CC300A",
			"XCC3000",
		].map((id) => ({ id, name: id, categoryTags: [] }));
		expect(
			filterCourseCatalog(entries, { category: "bachelor" }).map(
				(entry) => entry.id,
			),
		).toEqual(["CC3000", "CC7911", "CC4310"]);
		expect(
			filterCourseCatalog(entries, { category: "required" }).map(
				(entry) => entry.id,
			),
		).toEqual(["CC3001", "CC4900", "CC4902", "CC5900"]);
		expect(
			filterCourseCatalog(entries, { category: "bachelor", q: "4310" }).map(
				(entry) => entry.id,
			),
		).toEqual(["CC4310"]);
	});
	it("filters category membership and combines it with search", () => {
		const entries = ["MA3403", "CC5601", "IN3858", "CFIE006", "CC1001"].map(
			(id) => ({ id, name: id, categoryTags: [] }),
		);
		expect(filterCourseCatalog(entries, { category: "required" })).toEqual([
			entries[0],
		]);
		expect(filterCourseCatalog(entries, { category: "management" })).toEqual([
			entries[1],
			entries[2],
		]);
		expect(
			filterCourseCatalog(entries, { category: "specialization", q: "IN" }),
		).toEqual([entries[2]]);
		expect(filterCourseCatalog(entries, { category: "integral" })).toEqual([
			entries[3],
		]);
		expect(filterCourseCatalog(entries, { category: "bachelor" })).toEqual([]);
	});
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
			{ id: "CC3001", name: "Programacion", categoryTags: ["Software"] },
			{ id: "CC3000", name: "Sistemas", categoryTags: ["Sistemas"] },
		];

		expect(filterCourseCatalog(entries, { q: "cc3000" })).toEqual([entries[1]]);
		expect(filterCourseCatalog(entries, { tags: ["Software"] })).toEqual([
			entries[0],
		]);
	});

	it("defaults to the union of all five categories without duplicates", () => {
		const entries = [
			"CC1001",
			"CC1000",
			"CC1002",
			"CC3000",
			"CC3001",
			"CC5601",
			"CC5609",
			"EL4106",
			"MA3403",
			"CC9999",
		].map((id) => ({ id, name: id, categoryTags: [] }));
		expect(filterCourseCatalog(entries, {}).map((entry) => entry.id)).toEqual([
			"CC1000",
			"CC1002",
			"CC3000",
			"CC3001",
			"CC5601",
			"CC5609",
			"EL4106",
			"MA3403",
		]);
		expect(filterCourseCatalog(entries, { category: "dcc" })).toEqual(
			filterCourseCatalog(entries, {}),
		);
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
		expect(result.items.map((course) => course.reviewCount)).toEqual([10, 10]);

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
		expect(result.reviewCount).toBe(0);
		expect(
			toCourseCatalogItem(
				{ id: "CC1000", name: "A", categoryTags: [] },
				dynamicCourse,
			).ratings.carga,
		).toBe(5);
	});
});
