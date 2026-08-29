import type { CourseRatings } from "../../../shared/types/domain";

export interface ReviewAxisDef {
	key: keyof CourseRatings;
	label: string;
	question: string;
	levels: string[];
	emojis: string[];
}

export const reviewAxes: ReviewAxisDef[] = [
	{
		key: "carga",
		label: "Carga",
		question: "Tiempo dedicado",
		levels: ["Chacota", "Ligero", "Moderado", "Pesado", "Brutal"],
		emojis: ["🎁", "😴", "😅", "😰", "🥵"],
	},
	{
		key: "dificultad",
		label: "Dificultad",
		question: "Complejidad de la materia y las evaluaciones",
		levels: ["Trivial", "Manejable", "Desafiante", "Duro", "Letal"],
		emojis: ["🥱", "😎", "😬", "😫", "💀"],
	},
	{
		key: "docencia",
		label: "Docencia",
		question: "Equipo, clases y material.",
		levels: ["Pesimo", "Flojo", "Regular", "Solido", "Top"],
		emojis: ["😵", "😕", "🙂", "✨", "🎓"],
	},
	{
		key: "relevancia",
		label: "Utilidad",
		question: "Practicidad laboral y relevancia académica",
		levels: ["Inutil", "Basico", "Valioso", "Esencial", "Clave"],
		emojis: ["🙃", "🙂", "🤓", "🧠", "🤩"],
	},
	{
		key: "vibes",
		label: "Vibes",
		question: "Ambiente y experiencia del curso",
		levels: ["Toxico", "Fome", "Normal", "Buena onda", "Bacán"],
		emojis: ["😰", "😐", "🙂", "😊", "🥳"],
	},
];
