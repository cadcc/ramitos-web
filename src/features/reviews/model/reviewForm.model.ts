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
		question: "¿Cómo se reparte el trabajo y cuánto tiempo exige?",
		levels: ["Regalado", "Ligero", "Moderado", "Pesado", "Brutal"],
		emojis: ["🎁", "😴", "😅", "😰", "🥵"],
	},
	{
		key: "dificultad",
		label: "Dificultad",
		question: "¿Qué hace que el ramo sea fácil o desafiante?",
		levels: ["Trivial", "Manejable", "Desafiante", "Duro", "Letal"],
		emojis: ["🥱", "😎", "😬", "😫", "💀"],
	},
	{
		key: "docencia",
		label: "Docencia",
		question: "¿Cómo enseña y acompaña el equipo docente?",
		levels: ["Pesimo", "Flojo", "Regular", "Solido", "Top"],
		emojis: ["😵", "😕", "🙂", "✨", "🎓"],
	},
	{
		key: "relevancia",
		label: "Utilidad",
		question: "¿Para qué te sirve lo que aprendes?",
		levels: ["Inutil", "Basico", "Valioso", "Esencial", "Clave"],
		emojis: ["🙃", "🙂", "🤓", "🧠", "🤩"],
	},
	{
		key: "vibes",
		label: "Ambiente",
		question: "¿Cómo se vive el ramo entre clases y compañeros?",
		levels: ["Toxico", "Fome", "Normal", "Buena onda", "Bacán"],
		emojis: ["😰", "😐", "🙂", "😊", "🥳"],
	},
];
