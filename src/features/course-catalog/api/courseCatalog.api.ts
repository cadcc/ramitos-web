import { listCourses } from "../../../generated/api/course/courseService";
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

function categoryNames(
	indexes: number[] | undefined,
	categories: string[],
): string[] {
	return Array.from(
		new Set(
			(indexes ?? [])
				.map((index) => categories[index])
				.filter((category): category is string => Boolean(category)),
		),
	);
}

export function normalizeCourseCatalog(
	data: CoursesStaticDataContainer,
): CourseCatalogIndex {
	const items = data.courses.map((course) => ({
		id: course.code,
		name: course.name,
		categoryTags: categoryNames(course.categories, data.categories),
	}));

	return {
		items,
		categoryOptions: [...data.categories].sort((a, b) =>
			a.localeCompare(b, "es"),
		),
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
	// offering history, plan membership, and review counts are exposed.
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
		reviewCount: 0,
	};
}

export async function getCourseCatalogPage(
	entries: CourseCatalogEntry[],
	cursor = 0,
): Promise<CourseCatalogPage> {
	const pageEntries = entries.slice(cursor, cursor + COURSE_CATALOG_PAGE_SIZE);
	if (pageEntries.length === 0) return { items: [], nextCursor: null };

	const response = await listCourses({
		codes: pageEntries.map((course) => course.id),
	});
	const coursesById = new Map(
		response.data.map((course) => [course.id, course] as const),
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

export function sortLoadedCourseCatalog(
	courses: CursoListItem[],
	sort: CourseFilters["sort"],
): CursoListItem[] {
	if (sort !== "rating" && sort !== "reviews" && sort !== "recent") {
		return courses;
	}

	return [...courses].sort((a, b) => {
		if (sort === "rating")
			return averageScore(b.ratings) - averageScore(a.ratings);
		if (sort === "reviews") return b.reviewCount - a.reviewCount;
		return b.lastOffered.localeCompare(a.lastOffered);
	});
}

function averageScore(ratings: CourseRatings): number {
	return (
		(ratings.carga +
			ratings.dificultad +
			ratings.docencia +
			ratings.relevancia +
			ratings.vibes) /
		5
	);
}
