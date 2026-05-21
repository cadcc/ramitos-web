export type CourseEntryType = "course" | "plan" | "compactable" | "compacted";

export interface RoadmapData {
	v3: Record<string, never>;
	v5: Record<string, RoadmapPhaseData>;
}

export interface RoadmapPhaseData {
	name: string;
	semesters: Record<string, RoadmapSemesterData>;
}

export interface RoadmapSemesterData {
	number: number;
	courses: Record<string, RoadmapCourseData>;
}

export interface RoadmapCourseData {
	code: string;
	name: string;
	credits: number;
	prerequisites: string[];
	postrequisites: string[];
	department: string;
	type: CourseEntryType;
	plural?: string;
	shortname?: string;
	codes?: string[];
	corequisites?: string[];
}

export interface RoadmapCourse extends RoadmapCourseData {
	id: string;
	phaseName: string;
	semesterNumber: number;
}

export interface RoadmapSemester {
	id: string;
	number: number;
	phaseName: string;
	courses: RoadmapCourse[];
}

export interface RoadmapPhase {
	id: string;
	name: string;
	semesters: RoadmapSemester[];
}

export interface NormalizedRoadmap {
	phases: RoadmapPhase[];
	coursesById: Map<string, RoadmapCourse>;
}

export interface RoadmapSettings {
	depthpre: number;
	depthpost: number;
	showLines: boolean;
	showZeros: boolean;
	showCompacts: boolean;
	showPhases: boolean;
}

export type RoadmapMarkColor = 1 | 2 | 3 | 4;
export type RoadmapMark = 0 | RoadmapMarkColor;
export type RoadmapMarks = Record<string, RoadmapMark>;

export interface RoadmapSelection {
	selectedCourseId: string | null;
	prerequisiteDepths: Map<string, number>;
	postrequisiteDepths: Map<string, number>;
}
