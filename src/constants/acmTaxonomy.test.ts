import { expect, it } from "vitest";
import taxonomy from "../../data/courses/acm-taxonomy.json";
import courses from "../../data/courses/combined.json";
import {
	ACM_AREA_OPTIONS,
	ACM_TREE,
	getAcmAreas,
	matchesAcmNode,
	getAcmClassificationTree,
	getAcmAreaUnits,
} from "./acmTaxonomy";

it("returns assigned children only for a level-two knowledge area", () => {
	const units = ["IA-AA", "IA-PLN", "GD-Analítica", "IA-AA"];
	expect(getAcmAreaUnits(units, "IA").map((unit) => unit.id)).toEqual([
		"IA-AA",
		"IA-PLN",
	]);
	for (const id of [undefined, "APLICACIONES", "IA-PLN", "unknown"]) {
		expect(getAcmAreaUnits(units, id)).toEqual([]);
	}
	expect(getAcmAreaUnits([], "IA")).toEqual([]);
});

it("keeps every assigned unit in the course tree without unrelated branches", () => {
	for (const course of courses) {
		const tree = getAcmClassificationTree(course.acm);
		const displayed = tree.flatMap(
			(group) =>
				group.children?.flatMap(
					(area) => area.children?.map((unit) => unit.id) ?? [],
				) ?? [],
		);
		expect([...new Set(displayed)].sort(), course.codigo).toEqual(
			[...course.acm].sort(),
		);
	}
	expect(getAcmClassificationTree([])).toEqual([]);
	expect(getAcmClassificationTree(["unknown"])).toEqual([]);
});

it("matches all three levels and preserves shared areas in both competency groups", () => {
	expect(ACM_TREE).toHaveLength(4);
	expect(matchesAcmNode(["IA-PLN"], "APLICACIONES")).toBe(true);
	expect(matchesAcmNode(["IA-PLN"], "IA")).toBe(true);
	expect(matchesAcmNode(["IA-PLN"], "IA-PLN")).toBe(true);
	expect(matchesAcmNode(["IA-PLN"], "IA-AA")).toBe(false);
	expect(matchesAcmNode(["IA-PLN"], "SOFTWARE")).toBe(false);
	expect(matchesAcmNode(["GD-Consultas"], "SISTEMAS")).toBe(true);
	expect(matchesAcmNode(["GD-Consultas"], "APLICACIONES")).toBe(true);
	expect(matchesAcmNode([], "IA")).toBe(false);
	expect(matchesAcmNode(["IA-PLN"], "unknown")).toBe(false);
});

it("classifies every course with nonempty, unique, valid knowledge-unit IDs", () => {
	const units = new Set(
		taxonomy.cuerpo_de_conocimientos.flatMap((area) =>
			area.unidades_conocimiento.map((unit) => unit.id),
		),
	);
	expect(ACM_AREA_OPTIONS).toHaveLength(17);
	for (const course of courses) {
		expect(course.acm.length, course.codigo).toBeGreaterThan(0);
		expect(new Set(course.acm).size, course.codigo).toBe(course.acm.length);
		for (const unit of course.acm)
			expect(units.has(unit), `${course.codigo}: ${unit}`).toBe(true);
		expect(getAcmAreas(course.acm).length, course.codigo).toBeGreaterThan(0);
	}
});

it("resolves and deduplicates knowledge areas through taxonomy membership", () => {
	expect(getAcmAreas(["IA-AA", "IA-PLN", "DPE-SEP/Web", "unknown"])).toEqual([
		"IA",
		"DPE",
	]);
	expect(getAcmAreas([])).toEqual([]);
});
