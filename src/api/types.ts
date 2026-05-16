// TODO: DEPRECATE THIS

export type AccountRole = "none" | "stats" | "mod" | "admin";

export interface User {
	id: number;
	name: string;
	username: string;
	role: AccountRole;
	score: number;
	createdAt: string;
}

export interface Curso {
	id: string;
	name: string;
	code: string;
	credits: number;
	description: string;
	department: string;
	plan: "obligatorio" | "electivo_licenciatura" | "electivo_especialidad";
	categoryTags: string[];
	reviewTags: string[];
	currentlyOffered: boolean;
	lastOffered: string;
	ratings: CourseRatings;
	reviewCount: number;
	semesters: RamoSummary[];
}

export interface CourseRatings {
	carga: number;
	dificultad: number;
	docencia: number;
	relevancia: number;
	vibes: number;
}

export interface RamoSummary {
	year: number;
	semester: 1 | 2;
	sections: SeccionSummary[];
}

export interface SeccionSummary {
	id: string;
	professors: string[];
}

export interface CursoListItem {
	id: string;
	name: string;
	code: string;
	credits: number;
	department: string;
	plan: Curso["plan"];
	categoryTags: string[];
	currentlyOffered: boolean;
	lastOffered: string;
	ratings: CourseRatings;
	reviewCount: number;
}

export interface Review {
	id: number;
	cursoId: string;
	year: number;
	semester: 1 | 2;
	comment: string;
	ratings: CourseRatings;
	tags: string[];
	likes: number;
	dislikes: number;
	funny: number;
	hidden: boolean;
	createdAt: string;
}

export type SortOption =
	| "rating"
	| "reviews"
	| "recent"
	| "alphabetical"
	| "code";

export type ReviewSort = "newest" | "top";

export interface CourseFilters {
	q?: string;
	sort?: SortOption;
	plan?: Curso["plan"];
	tags?: string[];
	semester?: string;
	currentlyOffered?: boolean;
}

export interface PaginatedResponse<T> {
	items: T[];
	nextCursor: string | null;
	total: number;
}

export interface ReviewReaction {
	reviewId: number;
	type: "like" | "dislike" | "funny";
}

export interface ReviewSubmission {
	cursoId: string;
	year: number;
	semester: 1 | 2;
	comment: string;
	ratings: CourseRatings;
	tags: string[];
}
