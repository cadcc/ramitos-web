import type { CourseRatings } from "../api/types";

export type TagItem = string | [string, string];

export const AXIS_TAGS: Record<string, TagItem[]> = {
	carga: [
		["Carga liviana", "Mucha tarea"],
		"Muchas pruebas",
		"Proyecto grande",
		"Labs largos",
	],
	dificultad: [
		["Contenido accesible", "Materia compleja"],
		"Examenes dificiles",
		"Requiere base previa",
	],
	docencia: [
		["Poco material", "Buen material"],
		"Profe amigable",
		"Buen auxiliar",
		"Clases entretenidas",
	],
	relevancia: [
		["Poco practico", "Aplicable al trabajo"],
		"Util para la vida",
		"Clave para otros cursos",
	],
	vibes: [["Estresante", "Ambiente grato"], "Companerismo", "Motivante"],
};

export const MODALITY_TAGS: TagItem[] = [
	["Teorico", "Practico"],
	"Trabajo en equipo",
	"Mucha programacion",
	"Autoaprendizaje",
	"Evaluaciones justas",
	"Laboratorios",
	"Proyecto semestral",
];

function flattenTags(items: TagItem[]): string[] {
	return items.flatMap((item) => (Array.isArray(item) ? item : [item]));
}

export const ALL_REVIEW_TAGS = [
	...Object.values(AXIS_TAGS).flatMap(flattenTags),
	...flattenTags(MODALITY_TAGS),
];

export const AXIS_COLORS: Record<string, string> = {
	carga: "#CB4B16",
	dificultad: "#DC322F",
	docencia: "#268BD2",
	relevancia: "#859900",
	vibes: "#6C71C4",
};

const TAG_TO_AXIS = new Map<string, string>();
for (const [axis, items] of Object.entries(AXIS_TAGS)) {
	for (const tag of flattenTags(items)) TAG_TO_AXIS.set(tag, axis);
}

export function getTagColor(tag: string): string | undefined {
	const axis = TAG_TO_AXIS.get(tag);
	return axis ? AXIS_COLORS[axis] : undefined;
}

export function getAverageScore(ratings: CourseRatings): number {
	return Number(
		(
			(ratings.docencia +
				ratings.relevancia +
				ratings.vibes -
				ratings.carga * 0.3 -
				ratings.dificultad * 0.3) /
			3
		).toFixed(1),
	);
}
