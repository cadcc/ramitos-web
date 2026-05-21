import type {
	NormalizedRoadmap,
	RoadmapCourse,
	RoadmapData,
	RoadmapMarkColor,
	RoadmapMarks,
	RoadmapPhase,
	RoadmapSelection,
	RoadmapSettings,
} from "./types";

export const defaultRoadmapSettings: RoadmapSettings = {
	depthpre: 1,
	depthpost: 1,
	showLines: true,
	showZeros: false,
	showCompacts: true,
	showPhases: true,
};

export function clampDepth(value: number): number {
	if (!Number.isFinite(value)) return 1;
	return Math.max(1, Math.min(10, Math.round(value)));
}

export function normalizeRoadmapData(data: RoadmapData): NormalizedRoadmap {
	const coursesById = new Map<string, RoadmapCourse>();
	const phases: RoadmapPhase[] = Object.entries(data.v5).map(
		([phaseId, phase]) => {
			const semesters = Object.entries(phase.semesters)
				.map(([semesterId, semester]) => ({
					id: semesterId,
					number: semester.number,
					phaseName: phase.name,
					courses: Object.entries(semester.courses).map(
						([courseId, course]) => {
							const renderCourse: RoadmapCourse = {
								...course,
								id: courseId,
								phaseName: phase.name,
								semesterNumber: semester.number,
							};
							coursesById.set(courseId, renderCourse);
							return renderCourse;
						},
					),
				}))
				.sort((a, b) => a.number - b.number);

			return {
				id: phaseId,
				name: phase.name,
				semesters,
			};
		},
	);

	return { phases, coursesById };
}

export function isCourseVisible(
	course: RoadmapCourse,
	settings: RoadmapSettings,
): boolean {
	if (course.credits === 0 && !settings.showZeros) return false;
	if (course.type === "compacted" && !settings.showCompacts) return false;
	if (course.type === "compactable" && settings.showCompacts) return false;
	return true;
}

export function collectPrerequisites(
	courseId: string,
	coursesById: Map<string, RoadmapCourse>,
	maxDepth: number,
	depth = 0,
	result = new Map<string, number>(),
) {
	if (depth >= maxDepth) return result;
	const course = coursesById.get(courseId);
	if (!course) return result;

	for (const prereqId of course.prerequisites) {
		if (!coursesById.has(prereqId)) continue;
		const existingDepth = result.get(prereqId);
		if (existingDepth === undefined || depth < existingDepth) {
			result.set(prereqId, depth);
		}
		collectPrerequisites(prereqId, coursesById, maxDepth, depth + 1, result);
	}

	return result;
}

export function collectPostrequisites(
	courseId: string,
	coursesById: Map<string, RoadmapCourse>,
	maxDepth: number,
	depth = 0,
	result = new Map<string, number>(),
) {
	if (depth >= maxDepth) return result;
	const course = coursesById.get(courseId);
	if (!course) return result;

	for (const postreqId of course.postrequisites) {
		if (!coursesById.has(postreqId)) continue;
		const existingDepth = result.get(postreqId);
		if (existingDepth === undefined || depth < existingDepth) {
			result.set(postreqId, depth);
		}
		collectPostrequisites(postreqId, coursesById, maxDepth, depth + 1, result);
	}

	return result;
}

export function buildSelection(
	courseId: string | null,
	coursesById: Map<string, RoadmapCourse>,
	settings: RoadmapSettings,
): RoadmapSelection {
	if (!courseId) {
		return {
			selectedCourseId: null,
			prerequisiteDepths: new Map(),
			postrequisiteDepths: new Map(),
		};
	}

	return {
		selectedCourseId: courseId,
		prerequisiteDepths: collectPrerequisites(
			courseId,
			coursesById,
			settings.depthpre,
		),
		postrequisiteDepths: collectPostrequisites(
			courseId,
			coursesById,
			settings.depthpost,
		),
	};
}

export function toggleCourseMark(
	marks: RoadmapMarks,
	courseId: string,
	color: RoadmapMarkColor,
): RoadmapMarks {
	return {
		...marks,
		[courseId]: marks[courseId] === color ? 0 : color,
	};
}

export function updateSemesterMarks(
	marks: RoadmapMarks,
	courseIds: string[],
	color: RoadmapMarkColor,
): RoadmapMarks {
	const visibleIds = courseIds.filter(Boolean);
	const hasUnmarked = visibleIds.some((id) => !marks[id]);
	const hasDifferentColor = visibleIds.some(
		(id) => marks[id] && marks[id] !== color,
	);
	const next = { ...marks };

	for (const courseId of visibleIds) {
		if (hasUnmarked) {
			if (!next[courseId]) next[courseId] = color;
		} else if (hasDifferentColor) {
			if (next[courseId] !== color) next[courseId] = color;
		} else {
			next[courseId] = 0;
		}
	}

	return next;
}

export function getVisibleCourses(
	phases: RoadmapPhase[],
	settings: RoadmapSettings,
): RoadmapCourse[] {
	return phases.flatMap((phase) =>
		phase.semesters.flatMap((semester) =>
			semester.courses.filter((course) => isCourseVisible(course, settings)),
		),
	);
}

export function getCompletionStats(
	visibleCourses: RoadmapCourse[],
	marks: RoadmapMarks,
) {
	const total = visibleCourses.length;
	const marked = visibleCourses.filter((course) =>
		Boolean(marks[course.id]),
	).length;
	return {
		total,
		marked,
		complete: total > 0 && marked === total,
	};
}

export function opacityForDepth(depth: number): number {
	return Math.max(0.24, (80 - depth * 7) / 100);
}
