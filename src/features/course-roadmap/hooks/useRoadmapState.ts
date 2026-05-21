import { useCallback, useMemo, useRef, useState } from "react";
import {
	buildSelection,
	clampDepth,
	defaultRoadmapSettings,
	getCompletionStats,
	getVisibleCourses,
	isCourseVisible,
	normalizeRoadmapData,
	toggleCourseMark,
	updateSemesterMarks,
} from "../model/roadmapLogic";
import type {
	NormalizedRoadmap,
	RoadmapData,
	RoadmapMarkColor,
	RoadmapMarks,
	RoadmapSettings,
} from "../model/types";
import { usePersistentRoadmapState } from "./usePersistentRoadmapState";

const storageKeys = {
	settings: "malla:dcc:settings",
	editColor: "malla:dcc:editColor",
	marks: "malla:dcc:marks",
};

export function useRoadmapState(data: RoadmapData) {
	const normalized = useMemo<NormalizedRoadmap>(
		() => normalizeRoadmapData(data),
		[data],
	);
	const [settings, setSettings] = usePersistentRoadmapState<RoadmapSettings>(
		storageKeys.settings,
		defaultRoadmapSettings,
		sanitizeSettings,
	);
	const [editColor, setEditColor] = usePersistentRoadmapState<RoadmapMarkColor>(
		storageKeys.editColor,
		1,
		sanitizeEditColor,
	);
	const [marks, setMarks] = usePersistentRoadmapState<RoadmapMarks>(
		storageKeys.marks,
		{},
		sanitizeMarks,
	);
	const [editMode, setEditMode] = useState(false);
	const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
	const [touchSelectionId, setTouchSelectionId] = useState<string | null>(null);
	const isTouchDevice = useMemo(
		() =>
			typeof window !== "undefined" &&
			window.matchMedia("(hover: none)").matches,
		[],
	);

	const cardRefs = useRef(new Map<string, HTMLElement>());
	const visibleCourses = useMemo(
		() => getVisibleCourses(normalized.phases, settings),
		[normalized.phases, settings],
	);
	const visibleCourseIds = useMemo(
		() => new Set(visibleCourses.map((course) => course.id)),
		[visibleCourses],
	);
	const selection = useMemo(
		() =>
			buildSelection(
				editMode ? null : (touchSelectionId ?? selectedCourseId),
				normalized.coursesById,
				settings,
			),
		[
			editMode,
			normalized.coursesById,
			selectedCourseId,
			settings,
			touchSelectionId,
		],
	);
	const completion = useMemo(
		() => getCompletionStats(visibleCourses, marks),
		[marks, visibleCourses],
	);

	const updateSetting = useCallback(
		<K extends keyof RoadmapSettings>(key: K, value: RoadmapSettings[K]) => {
			setSettings((current) => ({
				...current,
				[key]:
					key === "depthpre" || key === "depthpost"
						? clampDepth(Number(value))
						: value,
			}));
		},
		[setSettings],
	);

	const registerCard = useCallback(
		(courseId: string, el: HTMLElement | null) => {
			if (el) cardRefs.current.set(courseId, el);
			else cardRefs.current.delete(courseId);
		},
		[],
	);

	const selectCourse = useCallback(
		(courseId: string | null) => {
			if (!editMode) {
				setSelectedCourseId((current) =>
					current === courseId ? current : courseId,
				);
			}
		},
		[editMode],
	);

	const toggleTouchSelection = useCallback(
		(courseId: string) => {
			if (editMode || !isTouchDevice) return;
			setTouchSelectionId((current) =>
				current === courseId ? null : courseId,
			);
		},
		[editMode, isTouchDevice],
	);

	const toggleMark = useCallback(
		(courseId: string) => {
			setMarks((current) => toggleCourseMark(current, courseId, editColor));
		},
		[editColor, setMarks],
	);

	const updateSemester = useCallback(
		(courseIds: string[]) => {
			setMarks((current) => updateSemesterMarks(current, courseIds, editColor));
		},
		[editColor, setMarks],
	);

	const clearMarks = useCallback(() => setMarks({}), [setMarks]);

	return {
		...normalized,
		cardRefs,
		completion,
		editColor,
		editMode,
		isCourseVisible: (courseId: string) => {
			const course = normalized.coursesById.get(courseId);
			return course ? isCourseVisible(course, settings) : false;
		},
		isTouchDevice,
		marks,
		registerCard,
		selectCourse,
		selection,
		setEditColor,
		setEditMode,
		settings,
		toggleMark,
		toggleTouchSelection,
		updateSemester,
		updateSetting,
		visibleCourseIds,
		visibleCourses,
		clearMarks,
	};
}

function sanitizeSettings(value: unknown): RoadmapSettings {
	const source = typeof value === "object" && value !== null ? value : {};
	const record = source as Partial<RoadmapSettings>;
	return {
		depthpre: clampDepth(record.depthpre ?? defaultRoadmapSettings.depthpre),
		depthpost: clampDepth(record.depthpost ?? defaultRoadmapSettings.depthpost),
		showLines: record.showLines ?? defaultRoadmapSettings.showLines,
		showZeros: record.showZeros ?? defaultRoadmapSettings.showZeros,
		showCompacts: record.showCompacts ?? defaultRoadmapSettings.showCompacts,
		showPhases: record.showPhases ?? defaultRoadmapSettings.showPhases,
	};
}

function sanitizeEditColor(value: unknown): RoadmapMarkColor {
	return value === 1 || value === 2 || value === 3 || value === 4 ? value : 1;
}

function sanitizeMarks(value: unknown): RoadmapMarks {
	if (typeof value !== "object" || value === null) return {};
	const result: RoadmapMarks = {};
	for (const [key, mark] of Object.entries(value)) {
		if (mark === 0 || mark === 1 || mark === 2 || mark === 3 || mark === 4) {
			result[key] = mark;
		}
	}
	return result;
}
