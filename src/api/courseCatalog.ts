import { listCourses } from "./course/courseService";
import type { Course } from "./course/models";
import type { CourseFilters, CourseRatings, CursoListItem } from "./types";

const PAGE_SIZE = 24;

export interface CourseCatalogPage {
	items: CursoListItem[];
	nextCursor: string | null;
}

function statValue(course: Course, key: keyof CourseRatings): number {
	const value = course.stats[key]?.value ?? 0;
	return Math.max(0, Math.min(5, value));
}

export function toCourseCatalogItem(course: Course): CursoListItem {
	return {
		id: course.id,
		name: course.name,
		code: course.id,
		credits: 0,
		department: "",
		plan: "electivo_especialidad",
		categoryTags: Object.keys(course.tag_stats),
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
	cursor?: string,
): Promise<CourseCatalogPage> {
	const response = await listCourses({
		limit: PAGE_SIZE,
		after: cursor,
	});
	const items = response.data.map(toCourseCatalogItem);

	return {
		items,
		nextCursor:
			response.data.length === PAGE_SIZE
				? (response.data[response.data.length - 1]?.id ?? null)
				: null,
	};
}

export function filterLoadedCourseCatalog(
	courses: CursoListItem[],
	filters: CourseFilters,
): CursoListItem[] {
	let filtered = courses;

	if (filters.q) {
		const q = filters.q.toLowerCase();
		filtered = filtered.filter(
			(course) =>
				course.name.toLowerCase().includes(q) ||
				course.code.toLowerCase().includes(q),
		);
	}

	if (filters.tags && filters.tags.length > 0) {
		filtered = filtered.filter((course) =>
			filters.tags!.some((tag) => course.categoryTags.includes(tag)),
		);
	}

	if (filters.sort) {
		filtered = [...filtered].sort((a, b) => {
			switch (filters.sort) {
				case "rating":
					return averageScore(b.ratings) - averageScore(a.ratings);
				case "alphabetical":
					return a.name.localeCompare(b.name, "es");
				case "code":
					return a.code.localeCompare(b.code);
				case "reviews":
				case "recent":
				default:
					return 0;
			}
		});
	}

	return filtered;
}

export function getLoadedCategoryTags(courses: CursoListItem[]): string[] {
	return Array.from(new Set(courses.flatMap((course) => course.categoryTags))).sort(
		(a, b) => a.localeCompare(b, "es"),
	);
}

function averageScore(ratings: CourseRatings): number {
	return (
		ratings.carga +
		ratings.dificultad +
		ratings.docencia +
		ratings.relevancia +
		ratings.vibes
	) / 5;
}
