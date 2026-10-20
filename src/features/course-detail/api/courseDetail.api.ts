import { session } from "../../auth";
import { getCourseSummaryTags } from "../../../constants/reviewTags";
import { getCourseMetadata } from "../../../constants/courseMetadata";
import { faker } from "@faker-js/faker";
import { getCourse } from "../../../generated/api/course/courseService";
import type { GetCourseResponseContent } from "../../../generated/api/course/models";
import type {
	CourseRatings,
	Curso,
	CursoListItem,
	RamoSummary,
} from "../../../shared/types/domain";

export const CURRENT_SEMESTER = "2026-1";

const RELATED_COURSE_POOL: Array<Pick<CursoListItem, "id" | "code" | "name">> =
	[
		{ id: "CC100", code: "CC100", name: "Computación I" },
		{ id: "CC1001", code: "CC1001", name: "Computación I" },
		{ id: "CC1002", code: "CC1002", name: "Introducción a la Programación" },
		{ id: "CC3001", code: "CC3001", name: "Algoritmos y Estructuras de Datos" },
		{ id: "CC4102", code: "CC4102", name: "Diseño y Análisis de Algoritmos" },
		{ id: "CC4301", code: "CC4301", name: "Arquitectura de Software" },
	];

function hashCourseId(courseId: string): number {
	let hash = 0;
	for (const char of courseId) {
		hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
	}
	return hash || 1;
}

function withCourseSeed<T>(courseId: string, offset: number, fn: () => T): T {
	faker.seed(hashCourseId(courseId) + offset);
	return fn();
}

function statValue(course: GetCourseResponseContent, key: keyof CourseRatings) {
	const value = course.stats[key]?.value ?? 0;
	return Math.max(0, Math.min(5, value));
}

function fallbackSemesters(courseId: string): RamoSummary[] {
	// TODO(backend): Replace with historical course offering data from the API.
	return withCourseSeed(courseId, 100, () => {
		const terms: RamoSummary[] = [];
		for (const year of [2024, 2025, 2026]) {
			for (const semester of [1, 2] as const) {
				if (year === 2026 && semester === 2) continue;
				if (faker.datatype.boolean({ probability: 0.72 })) {
					const sectionCount = faker.number.int({ min: 1, max: 4 });
					terms.push({
						year,
						semester,
						sections: Array.from({ length: sectionCount }, (_, index) => ({
							id: `${year}-${semester}-${index + 1}`,
							professors: [],
						})),
					});
				}
			}
		}
		return terms.length > 0
			? terms
			: [
					{
						year: 2026,
						semester: 1,
						sections: [{ id: "2026-1-1", professors: [] }],
					},
				];
	});
}

function fallbackPlan(courseId: string): Curso["plan"] {
	// TODO(backend): Replace with course plan metadata from the API.
	return withCourseSeed(courseId, 200, () =>
		faker.helpers.arrayElement([
			"obligatorio",
			"electivo_licenciatura",
			"electivo_especialidad",
		] satisfies Curso["plan"][]),
	);
}

function fallbackDepartment(courseId: string): string {
	// TODO(backend): Replace with course department metadata from the API.
	return withCourseSeed(courseId, 300, () =>
		faker.helpers.arrayElement([
			"Ciencias de la Computación",
			"Matemáticas",
			"Ingeniería Eléctrica",
			"Humanidades",
		]),
	);
}

function fallbackCredits(courseId: string): number {
	// TODO(backend): Replace with course credit metadata from the API.
	return withCourseSeed(courseId, 400, () =>
		faker.helpers.arrayElement([6, 9, 10, 12]),
	);
}

function toCourseDetail(course: GetCourseResponseContent): Curso {
	// TODO(backend): Once getCourse returns the full course detail view model, replace this adapter with the generated useGetCourse hook.
	const semesters = fallbackSemesters(course.id);
	const lastTerm = semesters[semesters.length - 1];
	const metadata = getCourseMetadata(course.id);

	return {
		id: course.id,
		name: course.name,
		enrolled: course.enrolled,
		reviewable: course.reviewable,
		code: course.id,
		credits: fallbackCredits(course.id),
		description: metadata?.summary ?? "Resumen no disponible.",
		syllabusUrl: metadata?.syllabusUrl,
		department: fallbackDepartment(course.id),
		plan: fallbackPlan(course.id),
		categoryTags: metadata?.categories ?? [],
		acmUnits: metadata?.acmUnits ?? [],
		reviewTags: getCourseSummaryTags(course.tag_stats),
		currentlyOffered: semesters.some(
			(term) => `${term.year}-${term.semester}` === CURRENT_SEMESTER,
		),
		lastOffered: lastTerm ? `${lastTerm.year}-${lastTerm.semester}` : "",
		ratings: {
			carga: statValue(course, "carga"),
			dificultad: statValue(course, "dificultad"),
			docencia: statValue(course, "docencia"),
			relevancia: statValue(course, "relevancia"),
			vibes: statValue(course, "vibes"),
		},
		reviewCount: course.reviewCount,
		commentReviewCount: course.commentReviewCount,
		semesters,
	};
}

function toRelatedCourse(
	course: Pick<CursoListItem, "id" | "code" | "name">,
): CursoListItem {
	return {
		...course,
		credits: 0,
		department: "",
		plan: "electivo_especialidad",
		categoryTags: [],
		currentlyOffered: false,
		lastOffered: "",
		ratings: {
			carga: 0,
			dificultad: 0,
			docencia: 0,
			relevancia: 0,
			vibes: 0,
		},
		reviewCount: 0,
	};
}

export async function getCourseDetail(
	courseId: string,
	authenticated = false,
): Promise<Curso | null> {
	const response = authenticated
		? await session.authenticated((headers) => getCourse(courseId, { headers }))
		: await getCourse(courseId);
	if ((response as { status: number }).status === 404) return null;
	if (response.status !== 200) throw new Error("Unable to load course");
	return toCourseDetail(response.data);
}

export function getRelatedCourses(
	courseId: string,
	count: number,
): CursoListItem[] {
	// TODO(backend): Replace with related course ids or a related-courses endpoint.
	// TODO(backend): Once related courses are exposed by the API, switch callers to the generated hook for that endpoint.
	return withCourseSeed(courseId, 600, () =>
		faker.helpers
			.shuffle(RELATED_COURSE_POOL.filter((course) => course.id !== courseId))
			.slice(0, count)
			.map(toRelatedCourse),
	);
}
