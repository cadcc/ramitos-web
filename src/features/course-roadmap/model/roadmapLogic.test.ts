import { describe, expect, it } from "vitest";
import {
	buildSelection,
	defaultRoadmapSettings,
	getCompletionStats,
	getVisibleCourses,
	isCourseVisible,
	normalizeRoadmapData,
	toggleCourseMark,
	updateSemesterMarks,
} from "./roadmapLogic";
import type { RoadmapCourse, RoadmapData } from "./types";
import type { RoadmapMarks } from "./types";

const fixture: RoadmapData = {
	v3: {},
	v5: {
		"Plan Comun": {
			name: "Plan Comun",
			semesters: {
				"1": {
					number: 1,
					courses: {
						A: course({
							code: "A",
							name: "A",
							postrequisites: ["B", "C"],
						}),
						ZERO: course({
							code: "ZERO",
							name: "Zero",
							credits: 0,
						}),
					},
				},
				"2": {
					number: 2,
					courses: {
						B: course({
							code: "B",
							name: "B",
							prerequisites: ["A"],
							postrequisites: ["C"],
						}),
						COMPACTABLE: course({
							code: "EL1",
							name: "Electivo individual",
							type: "compactable",
						}),
					},
				},
				"3": {
					number: 3,
					courses: {
						C: course({
							code: "C",
							name: "C",
							prerequisites: ["B", "A"],
						}),
						COMPACTED: course({
							code: "EL",
							name: "Electivos",
							type: "compacted",
						}),
					},
				},
			},
		},
	},
};

describe("roadmapLogic", () => {
	it("normalizes roadmap data and preserves object keys as course ids", () => {
		const normalized = normalizeRoadmapData(fixture);

		expect(normalized.phases).toHaveLength(1);
		expect(normalized.coursesById.get("COMPACTABLE")?.id).toBe("COMPACTABLE");
		expect(normalized.coursesById.get("COMPACTABLE")?.code).toBe("EL1");
		expect(
			normalized.phases[0]?.semesters.map((semester) => semester.number),
		).toEqual([1, 2, 3]);
	});

	it("applies visibility rules for zero-credit, compactable, and compacted courses", () => {
		const normalized = normalizeRoadmapData(fixture);
		const zero = normalized.coursesById.get("ZERO")!;
		const compactable = normalized.coursesById.get("COMPACTABLE")!;
		const compacted = normalized.coursesById.get("COMPACTED")!;

		expect(isCourseVisible(zero, defaultRoadmapSettings)).toBe(false);
		expect(isCourseVisible(compactable, defaultRoadmapSettings)).toBe(false);
		expect(isCourseVisible(compacted, defaultRoadmapSettings)).toBe(true);
		expect(
			isCourseVisible(compactable, {
				...defaultRoadmapSettings,
				showCompacts: false,
			}),
		).toBe(true);
	});

	it("collects prerequisite and postrequisite trees respecting configured depth", () => {
		const normalized = normalizeRoadmapData(fixture);
		const shallow = buildSelection("C", normalized.coursesById, {
			...defaultRoadmapSettings,
			depthpre: 1,
			depthpost: 1,
		});
		const deep = buildSelection("C", normalized.coursesById, {
			...defaultRoadmapSettings,
			depthpre: 2,
			depthpost: 1,
		});

		expect([...shallow.prerequisiteDepths.keys()].sort()).toEqual(["A", "B"]);
		expect(deep.prerequisiteDepths.get("A")).toBe(0);
		expect(deep.prerequisiteDepths.get("B")).toBe(0);
		expect(
			buildSelection(
				"A",
				normalized.coursesById,
				defaultRoadmapSettings,
			).postrequisiteDepths.has("B"),
		).toBe(true);
	});

	it("toggles individual course marks", () => {
		expect(toggleCourseMark({}, "A", 2)).toEqual({ A: 2 });
		expect(toggleCourseMark({ A: 2 }, "A", 2)).toEqual({ A: 0 });
		expect(toggleCourseMark({ A: 1 }, "A", 3)).toEqual({ A: 3 });
	});

	it("marks, swaps, and clears visible courses in a semester", () => {
		expect(updateSemesterMarks({}, ["A", "B"], 1)).toEqual({ A: 1, B: 1 });
		expect(updateSemesterMarks({ A: 1, B: 2 }, ["A", "B"], 1)).toEqual({
			A: 1,
			B: 1,
		});
		expect(updateSemesterMarks({ A: 1, B: 1 }, ["A", "B"], 1)).toEqual({
			A: 0,
			B: 0,
		});
	});

	it("computes completion using only visible courses", () => {
		const normalized = normalizeRoadmapData(fixture);
		const visible = getVisibleCourses(
			normalized.phases,
			defaultRoadmapSettings,
		);
		const marks: RoadmapMarks = Object.fromEntries(
			visible.map((course) => [course.id, 1]),
		);

		expect(visible.some((course) => course.id === "ZERO")).toBe(false);
		expect(getCompletionStats(visible, marks).complete).toBe(true);
		expect(getCompletionStats(visible, { ...marks, A: 0 }).complete).toBe(
			false,
		);
	});
});

function course(overrides: Partial<RoadmapCourse>): RoadmapCourse {
	return {
		id: overrides.id ?? overrides.code ?? "X",
		code: overrides.code ?? "X",
		name: overrides.name ?? "Course",
		credits: overrides.credits ?? 6,
		prerequisites: overrides.prerequisites ?? [],
		postrequisites: overrides.postrequisites ?? [],
		department: overrides.department ?? "CC",
		type: overrides.type ?? "course",
		phaseName: "Plan Comun",
		semesterNumber: 1,
		...overrides,
	};
}
