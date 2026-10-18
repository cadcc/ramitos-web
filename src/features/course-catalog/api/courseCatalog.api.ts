import { matchesCourseCategory } from "../courseCategories";
import {
	COURSE_TOPIC_OPTIONS,
	getCourseMetadata,
} from "../../../constants/courseMetadata";
import {
	getCoursesStaticData,
	listCourses,
} from "../../../generated/api/course/courseService";
import type {
	Course,
	CoursesStaticDataContainer,
} from "../../../generated/api/course/models";
import type {
	CourseFilters,
	CourseRatings,
	CursoListItem,
} from "../../../shared/types/domain";

export const COURSE_CATALOG_PAGE_SIZE = 24;

export interface CourseCatalogEntry {
	id: string;
	name: string;
	categoryTags: string[];
}

export interface CourseCatalogIndex {
	items: CourseCatalogEntry[];
	categoryOptions: string[];
	total: number;
}

export interface CourseCatalogPage {
	items: CursoListItem[];
	nextCursor: number | null;
}

function statValue(
	course: Course | undefined,
	key: keyof CourseRatings,
): number {
	const value = course?.stats[key]?.value ?? 0;
	return Math.max(0, Math.min(5, value));
}

export function normalizeCourseCatalog(
	data: CoursesStaticDataContainer,
): CourseCatalogIndex {
	const items = data.courses.map((course) => ({
		id: course.code,
		name: course.name,
		categoryTags: getCourseMetadata(course.code)?.categories ?? [],
	}));

	return {
		items,
		categoryOptions: COURSE_TOPIC_OPTIONS,
		total: data.count,
	};
}

export function toCourseCatalogItem(
	entry: CourseCatalogEntry,
	course?: Course,
): CursoListItem {
	const categoryTags = Array.from(
		new Set([...entry.categoryTags, ...Object.keys(course?.tag_stats ?? {})]),
	);

	// TODO(backend): Replace the remaining catalog defaults when credits,
	// offering history and plan membership are exposed.
	return {
		id: entry.id,
		name: entry.name,
		code: entry.id,
		credits: 0,
		department: "",
		plan: "electivo_especialidad",
		categoryTags,
		currentlyOffered: false,
		lastOffered: "",
		ratings: {
			carga: statValue(course, "carga"),
			dificultad: statValue(course, "dificultad"),
			docencia: statValue(course, "docencia"),
			relevancia: statValue(course, "relevancia"),
			vibes: statValue(course, "vibes"),
		},
		reviewCount: course?.reviewCount ?? 0,
	};
}

export async function getCourseCatalogPage(
	entries: CourseCatalogEntry[],
	cursor = 0,
	reviewableCourses?: Course[],
): Promise<CourseCatalogPage> {
	const pageEntries = entries.slice(cursor, cursor + COURSE_CATALOG_PAGE_SIZE);
	if (pageEntries.length === 0) return { items: [], nextCursor: null };

	const courses =
		reviewableCourses ??
		(
			await listCourses({
				codes: pageEntries.map((course) => course.id),
			})
		).data;
	const coursesById = new Map(
		courses.map((course) => [course.id, course] as const),
	);
	const nextCursor = cursor + pageEntries.length;

	return {
		items: pageEntries.map((entry) =>
			toCourseCatalogItem(entry, coursesById.get(entry.id)),
		),
		nextCursor: nextCursor < entries.length ? nextCursor : null,
	};
}

export function filterCourseCatalog(
	entries: CourseCatalogEntry[],
	filters: CourseFilters,
): CourseCatalogEntry[] {
	// TODO(backend): Move filtering and sorting to listCourses when the endpoint
	// accepts catalog filters and returns complete sort metadata.
	let filtered = entries;

	filtered = filtered.filter((course) =>
		matchesCourseCategory(course.id, filters.category ?? "dcc"),
	);

	if (filters.q) {
		const query = filters.q.toLocaleLowerCase("es");
		filtered = filtered.filter(
			(course) =>
				course.name.toLocaleLowerCase("es").includes(query) ||
				course.id.toLocaleLowerCase("es").includes(query),
		);
	}

	if (filters.tags?.length) {
		filtered = filtered.filter((course) =>
			filters.tags!.some((tag) => course.categoryTags.includes(tag)),
		);
	}

	if (filters.sort === "alphabetical") {
		return [...filtered].sort((a, b) => a.name.localeCompare(b.name, "es"));
	}

	if (filters.sort === "code") {
		return [...filtered].sort((a, b) => a.id.localeCompare(b.id, "es"));
	}

	return filtered;
}

export async function getCourseCatalogIndex(): Promise<CourseCatalogIndex> {
	const response = await getCoursesStaticData();
	if (response.status !== 200) throw new Error("Unable to load catalog index");
	return normalizeCourseCatalog(response.data);
}
