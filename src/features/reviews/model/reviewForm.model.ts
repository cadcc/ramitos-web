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
		question: "Cuanto tiempo y esfuerzo requiere?",
		levels: ["Chacota", "Ligero", "Moderado", "Pesado", "Brutal"],
		emojis: ["🎁", "😴", "😅", "😰", "🥵"],
	},
	{
		key: "dificultad",
		label: "Dificultad",
		question: "Que tan complejo es el contenido?",
		levels: ["Trivial", "Manejable", "Desafiante", "Duro", "Letal"],
		emojis: ["🥱", "😎", "😬", "😫", "💀"],
	},
	{
		key: "docencia",
		label: "Docencia",
		question: "Calidad de clases y apoyo?",
		levels: ["Pesimo", "Flojo", "Regular", "Solido", "Top"],
		emojis: ["😵", "😕", "🙂", "✨", "🎓"],
	},
	{
		key: "relevancia",
		label: "Utilidad",
		question: "Que tan util es?",
		levels: ["Inutil", "Basico", "Valioso", "Esencial", "Clave"],
		emojis: ["🙃", "🙂", "🤓", "🧠", "🤩"],
	},
	{
		key: "vibes",
		label: "Vibes",
		question: "Como es el ambiente?",
		levels: ["Toxico", "Fome", "Normal", "Buena onda", "Energia full"],
		emojis: ["😰", "😐", "🙂", "😊", "🥳"],
	},
];
