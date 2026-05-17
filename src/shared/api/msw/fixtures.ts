import { faker } from "@faker-js/faker";
import type { HttpResponseResolver } from "msw";
import {
	AccountRole,
	type GetSelfResponseContent,
} from "../../../generated/api/account/models";
import type { PasswordLoginResponseContent } from "../../../generated/api/authentication/models";
import type {
	Course,
	ListCoursesOutputPayload,
} from "../../../generated/api/course/models";
import type { ListCourseReviewsOutputPayload } from "../../../generated/api/anonymous-review/models";
import type {
	CreateReviewRequestContent,
	CreateReviewResponseContent,
	GetReviewResponseContent,
	ListReviewsOutputPayload,
	Review,
	ReviewStats,
} from "../../../generated/api/review/models";

type RequestInfo = Parameters<HttpResponseResolver>[0];

const COURSE_TAGS = [
	"Programación",
	"Algoritmos",
	"Inteligencia Artificial",
	"Machine Learning",
	"Bases de Datos",
	"Redes",
	"Sistemas Operativos",
	"Seguridad",
	"Desarrollo Web",
	"Computación Gráfica",
	"Software Engineering",
	"Lenguajes",
	"Datos",
	"HCI",
	"Videojuegos",
	"Gestión",
	"Teoría",
	"NLP",
];

const REVIEW_TAGS = [
	"Carga liviana",
	"Mucha tarea",
	"Muchas pruebas",
	"Proyecto grande",
	"Labs largos",
	"Contenido accesible",
	"Materia compleja",
	"Examenes dificiles",
	"Requiere base previa",
	"Buen material",
	"Profe amigable",
	"Buen auxiliar",
	"Clases entretenidas",
	"Aplicable al trabajo",
	"Clave para otros cursos",
	"Ambiente grato",
	"Companerismo",
	"Motivante",
	"Trabajo en equipo",
	"Mucha programacion",
	"Autoaprendizaje",
	"Evaluaciones justas",
	"Laboratorios",
	"Proyecto semestral",
];

const COURSE_SEEDS = [
	["CC100", "Computacion I", ["Programación", "Algoritmos"]],
	["CC1001", "Introduccion a la Programacion", ["Programación"]],
	["CC1002", "Programacion Avanzada", ["Programación", "Lenguajes"]],
	["CC3001", "Algoritmos y Estructuras de Datos", ["Algoritmos"]],
	["CC3101", "Matematicas Discretas", ["Teoría"]],
	["CC3201", "Bases de Datos", ["Bases de Datos", "Datos"]],
	["CC3301", "Redes de Computadores", ["Redes", "Sistemas Operativos"]],
	["CC3501", "Arquitectura de Computadores", ["Sistemas Operativos"]],
	["CC4101", "Lenguajes de Programacion", ["Lenguajes", "Teoría"]],
	["CC4102", "Diseno y Analisis de Algoritmos", ["Algoritmos", "Teoría"]],
	["CC4301", "Arquitectura de Software", ["Software Engineering"]],
	["CC4401", "Ingenieria de Software", ["Software Engineering", "Gestión"]],
	["CC5206", "Data Mining", ["Datos", "Machine Learning"]],
	["CC5301", "Bases de Datos Avanzadas", ["Bases de Datos", "Datos"]],
	["CC5401", "Inteligencia Artificial", ["Inteligencia Artificial"]],
	["CC5508", "Procesamiento de Lenguaje Natural", ["NLP", "Machine Learning"]],
	["CC5601", "Computacion Grafica", ["Computación Gráfica"]],
	["CC5901", "Desarrollo Web", ["Desarrollo Web", "HCI"]],
] satisfies Array<[string, string, string[]]>;
const FALLBACK_COURSE_SEED = COURSE_SEEDS[0] as [string, string, string[]];

const TEST_ACCOUNT: GetSelfResponseContent = {
	id: 1,
	name: "Eric MasterDev",
	role: AccountRole.admin,
	created_at: "2025-03-01T12:00:00Z",
	updated_at: "2026-05-01T09:00:00Z",
};

const ACCOUNTS: GetSelfResponseContent[] = [
	TEST_ACCOUNT,
	{
		id: 2,
		name: "Camila Review",
		role: AccountRole.none,
		created_at: "2024-09-10T15:00:00Z",
		updated_at: "2026-02-21T11:30:00Z",
	},
	{
		id: 3,
		name: "Mateo Sistemas",
		role: AccountRole.mod,
		created_at: "2024-04-18T10:15:00Z",
		updated_at: "2026-03-02T08:10:00Z",
	},
];

let nextReviewId = 9000;
const reviewsByCourse = new Map<string, Review[]>();

function numberFromText(value: string): number {
	let hash = 0;
	for (const char of value) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
	return hash || 1;
}

function withSeed<T>(seed: string | number, fn: () => T): T {
	faker.seed(typeof seed === "number" ? seed : numberFromText(seed));
	return fn();
}

function rating(base: number, variance = 1.1): number {
	return Math.max(
		1,
		Math.min(
			5,
			Number(
				faker.number
					.float({
						min: base - variance,
						max: base + variance,
						fractionDigits: 1,
					})
					.toFixed(1),
			),
		),
	);
}

function statsForCourse(courseCode: string): ReviewStats {
	return withSeed(`${courseCode}:stats`, () => {
		const friendly = faker.number.float({
			min: 2.8,
			max: 4.8,
			fractionDigits: 1,
		});
		return {
			docencia: rating(friendly),
			vibes: rating(friendly - 0.1),
			relevancia: rating(friendly + 0.2),
			carga: rating(
				faker.number.float({ min: 2.1, max: 4.6, fractionDigits: 1 }),
				0.8,
			),
			dificultad: rating(
				faker.number.float({ min: 2.2, max: 4.9, fractionDigits: 1 }),
				0.8,
			),
		};
	});
}

function courseFromSeed([
	id,
	name,
	tags,
]: (typeof COURSE_SEEDS)[number]): Course {
	const stats = statsForCourse(id);
	return {
		id,
		name,
		stats: {
			docencia: { value: stats.docencia ?? 0 },
			vibes: { value: stats.vibes ?? 0 },
			relevancia: { value: stats.relevancia ?? 0 },
			carga: { value: stats.carga ?? 0 },
			dificultad: { value: stats.dificultad ?? 0 },
		},
		tag_stats: Object.fromEntries(
			tags.map((tag) => [
				tag,
				{
					value: withSeed(`${id}:${tag}`, () =>
						faker.number.int({ min: 4, max: 42 }),
					),
				},
			]),
		),
	};
}

const courses: Course[] = [
	...COURSE_SEEDS.map(courseFromSeed),
	...Array.from({ length: 42 }, (_, index) =>
		withSeed(`extra-course-${index}`, () => {
			const prefix = faker.helpers.arrayElement(["CC", "MA", "EL", "IN"]);
			const id = `${prefix}${faker.number.int({ min: 2000, max: 6999 })}`;
			const tags = faker.helpers.arrayElements(
				COURSE_TAGS,
				faker.number.int({ min: 1, max: 3 }),
			);
			return courseFromSeed([
				id,
				`${faker.helpers.arrayElement(["Topicos", "Taller", "Introduccion", "Laboratorio", "Seminario"])} de ${faker.helpers.arrayElement(tags)}`,
				tags,
			]);
		}),
	),
].sort((a, b) => a.id.localeCompare(b.id));

function commentFor(course: Course, stats: ReviewStats): string {
	const templates = [
		`${course.name} exige constancia, pero las tareas ayudan mucho a entender la materia.`,
		`Buen ramo si quieres practicar de verdad. La carga sube cerca de las entregas.`,
		`Me sirvio para conectar teoria con proyectos mas reales. Recomendado con tiempo.`,
		`La experiencia depende harto del equipo, pero el contenido queda bien instalado.`,
		`No es un ramo para dejar al final. Con estudio semanal se vuelve manejable.`,
	];
	const base = faker.helpers.arrayElement(templates);
	if ((stats.dificultad ?? 0) >= 4.2)
		return `${base} Los controles fueron especialmente exigentes.`;
	if ((stats.docencia ?? 0) >= 4.2)
		return `${base} El equipo docente estuvo muy presente.`;
	return base;
}

function makeReview(course: Course, index: number, accountId?: number): Review {
	return withSeed(`${course.id}:review:${index}:${accountId ?? "anon"}`, () => {
		const stats = statsForCourse(`${course.id}:${index}`);
		return {
			id: numberFromText(`${course.id}:${index}:${accountId ?? 0}`) % 100000,
			account_id: accountId ?? faker.helpers.arrayElement(ACCOUNTS).id,
			course_code: course.id,
			comments: commentFor(course, stats),
			stats,
			tags: faker.helpers.arrayElements(
				REVIEW_TAGS,
				faker.number.int({ min: 2, max: 5 }),
			),
			created_at:
				faker.date.recent({ days: 180 }).toISOString().slice(0, 19) + "Z",
		};
	});
}

function seedReviews() {
	for (const course of courses) {
		const reviewCount = withSeed(`${course.id}:review-count`, () =>
			faker.number.int({ min: 0, max: 12 }),
		);
		const reviews = Array.from({ length: reviewCount }, (_, index) =>
			makeReview(course, index + 1),
		);
		if (course.id === "CC4101")
			reviews.unshift(makeReview(course, 99, TEST_ACCOUNT.id));
		if (course.id === "CC100")
			reviews.unshift(makeReview(course, 88, TEST_ACCOUNT.id));
		reviewsByCourse.set(
			course.id,
			reviews.sort(
				(a, b) =>
					new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
			),
		);
	}
}

seedReviews();

function pageByCursor<T extends { id: string | number }>(
	items: T[],
	limit: number,
	after: string | number | null,
): T[] {
	const start =
		after === null
			? 0
			: Math.max(
					0,
					items.findIndex((item) => String(item.id) === String(after)) + 1,
				);
	return items.slice(start, start + limit);
}

function searchParam(info: RequestInfo, key: string): string | null {
	return new URL(info.request.url).searchParams.get(key);
}

function authAccount(info: RequestInfo): GetSelfResponseContent {
	const header = info.request.headers.get("Authorization");
	const token = header?.replace(/^Bearer\s+/i, "");
	if (!token) return TEST_ACCOUNT;
	try {
		const payload = JSON.parse(atob(token.split(".")[1] ?? ""));
		const account = payload.account;
		if (account?.id) {
			return {
				id: Number(account.id),
				name: String(account.displayName ?? account.name ?? TEST_ACCOUNT.name),
				role: account.role ?? TEST_ACCOUNT.role,
				created_at: String(account.createdAt ?? TEST_ACCOUNT.created_at),
				updated_at: new Date().toISOString().slice(0, 19) + "Z",
			};
		}
	} catch {
		/* use the stable mock account */
	}
	return TEST_ACCOUNT;
}

function jwtFor(account: GetSelfResponseContent): string {
	const payload = {
		exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8,
		account: {
			id: account.id,
			displayName: account.name,
			role: account.role,
			createdAt: account.created_at,
		},
	};
	const encode = (value: unknown) =>
		btoa(JSON.stringify(value))
			.replace(/=/g, "")
			.replace(/\+/g, "-")
			.replace(/\//g, "_");
	return `${encode({ alg: "none", typ: "JWT" })}.${encode(payload)}.mock-signature`;
}

function courseByParam(info: RequestInfo): Course {
	const param = info.params.courseId ?? info.params.courseCode;
	const courseCode = Array.isArray(param) ? param[0] : String(param);
	return (
		courses.find((course) => course.id === courseCode) ??
		courseFromSeed([courseCode, `Curso ${courseCode}`, ["Programación"]])
	);
}

export function mockListCourses(info: RequestInfo): ListCoursesOutputPayload {
	const limit = Number(searchParam(info, "limit") ?? 24);
	const after = searchParam(info, "after");
	return pageByCursor(courses, limit, after);
}

export function mockGetCourse(info: RequestInfo): Course {
	return courseByParam(info);
}

export function mockListCourseReviews(
	info: RequestInfo,
): ListCourseReviewsOutputPayload {
	const course = courseByParam(info);
	const limit = Number(searchParam(info, "limit") ?? 10);
	const after = searchParam(info, "after");
	return pageByCursor(reviewsByCourse.get(course.id) ?? [], limit, after).map(
		(review) => ({
			id: review.id,
			comments: review.comments ?? "",
			stats: review.stats,
			tags: review.tags,
			created_at: review.created_at,
		}),
	);
}

export function mockListReviews(info: RequestInfo): ListReviewsOutputPayload {
	const params = new URL(info.request.url).searchParams;
	const courseId = params.get("course_id");
	const accountId = params.get("account_id");
	const limit = Number(params.get("limit") ?? 10);
	const after = params.get("after");
	const allReviews = Array.from(reviewsByCourse.values()).flat();
	const filtered = allReviews.filter((review) => {
		if (courseId && review.course_code !== courseId) return false;
		if (accountId && review.account_id !== Number(accountId)) return false;
		return true;
	});
	return pageByCursor(
		filtered.sort(
			(a, b) =>
				new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
		),
		limit,
		after,
	);
}

export async function mockCreateReview(
	info: RequestInfo,
): Promise<CreateReviewResponseContent> {
	const body = (await info.request.json()) as CreateReviewRequestContent;
	const account = authAccount(info);
	const course =
		courses.find((item) => item.id === body.course_code) ??
		courseFromSeed([
			body.course_code,
			`Curso ${body.course_code}`,
			["Programación"],
		]);
	const existing = reviewsByCourse.get(course.id) ?? [];
	const previous = existing.find((review) => review.account_id === account.id);
	const review: Review = {
		id: previous?.id ?? nextReviewId++,
		account_id: account.id,
		course_code: course.id,
		comments: body.comments,
		stats: body.stats,
		tags: body.tags,
		created_at: new Date().toISOString().slice(0, 19) + "Z",
	};
	reviewsByCourse.set(
		course.id,
		[review, ...existing.filter((item) => item.id !== review.id)].sort(
			(a, b) =>
				new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
		),
	);
	return review;
}

export function mockGetReview(info: RequestInfo): GetReviewResponseContent {
	const param = info.params.reviewId;
	const reviewId = Number(Array.isArray(param) ? param[0] : param);
	const fallbackCourse = courses[0] ?? courseFromSeed(FALLBACK_COURSE_SEED);
	return (
		Array.from(reviewsByCourse.values())
			.flat()
			.find((review) => review.id === reviewId) ??
		makeReview(fallbackCourse, reviewId)
	);
}

export function mockPasswordLogin(): PasswordLoginResponseContent {
	return { accessToken: jwtFor(TEST_ACCOUNT) };
}

export function mockGetSelf(info: RequestInfo): GetSelfResponseContent {
	return authAccount(info);
}
