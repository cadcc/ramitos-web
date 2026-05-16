// TODO: DEPRECATE THIS

import type {
	Curso,
	CursoListItem,
	Review,
	User,
	CourseRatings,
	RamoSummary,
} from "./types";

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
		"Exámenes difíciles",
		"Requiere base previa",
	],
	docencia: [
		["Poco material", "Buen material"],
		"Profe amigable",
		"Buen auxiliar",
		"Clases entretenidas",
	],
	relevancia: [
		["Poco práctico", "Aplicable al trabajo"],
		"Útil para la vida",
		"Clave para otros cursos",
	],
	vibes: [["Estresante", "Ambiente grato"], "Compañerismo", "Motivante"],
};

export const MODALITY_TAGS: TagItem[] = [
	["Teórico", "Práctico"],
	"Trabajo en equipo",
	"Mucha programación",
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

const TAG_TO_AXIS = new Map<string, string>();
for (const [axis, items] of Object.entries(AXIS_TAGS)) {
	for (const tag of flattenTags(items)) TAG_TO_AXIS.set(tag, axis);
}

export function getTagColor(tag: string): string | undefined {
	const axis = TAG_TO_AXIS.get(tag);
	return axis ? AXIS_COLORS[axis] : undefined;
}

export const CATEGORY_TAGS = [
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

export const AXIS_COLORS: Record<string, string> = {
	carga: "#CB4B16",
	dificultad: "#DC322F",
	docencia: "#268BD2",
	relevancia: "#859900",
	vibes: "#6C71C4",
};

export const DEPARTMENTS = [
	"Ciencias de la Computación",
	"Matemáticas",
	"Física",
	"Ingeniería Eléctrica",
	"Humanidades",
];

const PROFESSORS = [
	"Nelson Baloian",
	"Juan Álvarez",
	"Cristian Parra",
	"Patricio Inostroza",
	"Francisco Gutiérrez",
	"Iván Sipiran",
	"Patricio Poblete",
	"Matías Toro",
	"Ignacio Slater",
	"Arturo Merino",
	"Jocelyn Simmonds",
	"Andrés Abeliuk",
	"Eduardo Godoy",
	"Cristian Salazar",
	"Nicolás Lehmann",
	"Luis Mateu",
	"Claudia López",
	"Eduardo Graells",
	"Nancy Hitschfeld",
	"Éric Tanter",
	"Ismael Figueroa",
	"Gonzalo Navarro",
	"Benjamín Bustos",
	"Lucas Torrealba",
	"Rodrigo Arenas",
	"Ivana Bachmann",
	"Gonzalo Alarcón",
	"Sergio Ochoa",
	"Daniel Perovich",
	"Mauricio Cerda",
	"Valentin Barriere",
	"Alejandro Hevia",
	"Claudio Gutiérrez",
	"Felipe Bravo",
	"Juan Manuel Barrios",
	"Cecilia Bastarrica",
	"José Urzúa",
	"Valentín Muñoz",
	"Federico Olmedo",
];

function r(min: number, max: number, decimals = 1): number {
	const val = Math.random() * (max - min) + min;
	return Number(val.toFixed(decimals));
}

function pick<T>(arr: T[], count: number): T[] {
	const shuffled = [...arr].sort(() => Math.random() - 0.5);
	return shuffled.slice(0, count);
}

function generateRatings(): CourseRatings {
	return {
		carga: r(1.5, 5),
		dificultad: r(1.5, 5),
		docencia: r(2, 5),
		relevancia: r(2, 5),
		vibes: r(1.5, 5),
	};
}

function generateSemesters(
	code: string,
	plan: string,
	lastOffered: string,
): RamoSummary[] {
	const semesters: RamoSummary[] = [];
	const isObl = plan === "obligatorio";

	for (let year = 2016; year <= 2026; year++) {
		for (const sem of [1, 2] as const) {
			const semKey = `${year}-${sem}`;

			if (year === 2026 && sem === 2) continue;

			if (semKey === lastOffered) {
				const numSections = isObl
					? Math.floor(Math.random() * 2) + 2
					: Math.floor(Math.random() * 2) + 1;
				semesters.push({
					year,
					semester: sem,
					sections: Array.from({ length: numSections }, (_, i) => ({
						id: `${code}-${year}${sem}-s${i + 1}`,
						professors: pick(PROFESSORS, Math.random() > 0.6 ? 2 : 1),
					})),
				});
				continue;
			}

			const chance = isObl ? 0.75 : 0.4;
			if (Math.random() > chance) continue;

			const numSections = isObl
				? Math.floor(Math.random() * 3) + 1
				: Math.floor(Math.random() * 2) + 1;
			semesters.push({
				year,
				semester: sem,
				sections: Array.from({ length: numSections }, (_, i) => ({
					id: `${code}-${year}${sem}-s${i + 1}`,
					professors: pick(PROFESSORS, Math.random() > 0.6 ? 2 : 1),
				})),
			});
		}
	}

	return semesters;
}

const courseDefinitions: Omit<
	Curso,
	"ratings" | "reviewCount" | "semesters" | "reviewTags"
>[] = [
	{
		id: "cc1000",
		name: "Herramientas Computacionales para Ingeniería y Ciencias",
		code: "CC1000",
		credits: 3,
		description:
			"Introducción práctica a herramientas computacionales esenciales para ingeniería y ciencias. Cubre uso de terminal, control de versiones, automatización básica y pensamiento computacional.",
		department: "Ciencias de la Computación",
		plan: "obligatorio",
		categoryTags: ["Programación"],
		currentlyOffered: true,
		lastOffered: "2026-1",
	},
	{
		id: "cc1002",
		name: "Introducción a la Programación",
		code: "CC1002",
		credits: 6,
		description:
			"Curso introductorio que cubre los fundamentos de la programación imperativa usando Python. Incluye tipos de datos, control de flujo, funciones, recursión y estructuras de datos básicas.",
		department: "Ciencias de la Computación",
		plan: "obligatorio",
		categoryTags: ["Programación"],
		currentlyOffered: true,
		lastOffered: "2026-1",
	},
	{
		id: "cc3001",
		name: "Algoritmos y Estructuras de Datos",
		code: "CC3001",
		credits: 6,
		description:
			"Estudio de algoritmos fundamentales de ordenamiento, búsqueda y grafos. Análisis de complejidad temporal y espacial. Estructuras de datos como árboles, heaps, tablas hash y grafos.",
		department: "Ciencias de la Computación",
		plan: "obligatorio",
		categoryTags: ["Algoritmos", "Programación"],
		currentlyOffered: true,
		lastOffered: "2026-1",
	},
	{
		id: "cc3002",
		name: "Metodologías de Diseño y Programación",
		code: "CC3002",
		credits: 6,
		description:
			"Diseño orientado a objetos, patrones de diseño, principios SOLID, testing unitario y refactoring. Uso de Java como lenguaje principal.",
		department: "Ciencias de la Computación",
		plan: "obligatorio",
		categoryTags: ["Software Engineering", "Programación"],
		currentlyOffered: true,
		lastOffered: "2026-1",
	},
	{
		id: "cc3101",
		name: "Matemáticas Discretas para la Computación",
		code: "CC3101",
		credits: 6,
		description:
			"Lógica proposicional, teoría de conjuntos, relaciones, funciones, inducción, combinatoria, teoría de grafos y nociones de computabilidad. Base matemática para la computación.",
		department: "Ciencias de la Computación",
		plan: "obligatorio",
		categoryTags: ["Teoría", "Algoritmos"],
		currentlyOffered: true,
		lastOffered: "2026-1",
	},
	{
		id: "cc3102",
		name: "Teoría de la Computación",
		code: "CC3102",
		credits: 6,
		description:
			"Autómatas finitos, lenguajes regulares, gramáticas libres de contexto, máquinas de Turing, decidibilidad y complejidad computacional.",
		department: "Ciencias de la Computación",
		plan: "obligatorio",
		categoryTags: ["Teoría"],
		currentlyOffered: true,
		lastOffered: "2026-1",
	},
	{
		id: "cc3201",
		name: "Bases de Datos",
		code: "CC3201",
		credits: 6,
		description:
			"Diseño e implementación de bases de datos relacionales. Modelo entidad-relación, álgebra relacional, SQL, normalización, transacciones y optimización de consultas.",
		department: "Ciencias de la Computación",
		plan: "obligatorio",
		categoryTags: ["Bases de Datos", "Programación"],
		currentlyOffered: true,
		lastOffered: "2026-1",
	},
	{
		id: "cc3301",
		name: "Programación de Software de Sistemas",
		code: "CC3301",
		credits: 6,
		description:
			"Programación en C, manejo de memoria, procesos, signals, I/O de bajo nivel y herramientas de desarrollo de sistemas. Laboratorios prácticos intensivos.",
		department: "Ciencias de la Computación",
		plan: "obligatorio",
		categoryTags: ["Sistemas Operativos", "Programación"],
		currentlyOffered: true,
		lastOffered: "2026-1",
	},
	{
		id: "cc3401",
		name: "Interacción Humano-Computador",
		code: "CC3401",
		credits: 6,
		description:
			"Diseño centrado en el usuario, usabilidad, prototipado, evaluación heurística, estudios con usuarios y diseño de interfaces accesibles.",
		department: "Ciencias de la Computación",
		plan: "obligatorio",
		categoryTags: ["HCI", "Software Engineering"],
		currentlyOffered: true,
		lastOffered: "2026-1",
	},
	{
		id: "cc3501",
		name: "Modelación y Computación Gráfica para Ingenieros",
		code: "CC3501",
		credits: 6,
		description:
			"Pipeline gráfico, transformaciones 2D y 3D, iluminación, texturas, curvas y superficies. Proyectos prácticos con OpenGL y Python.",
		department: "Ciencias de la Computación",
		plan: "obligatorio",
		categoryTags: ["Computación Gráfica", "Programación"],
		currentlyOffered: true,
		lastOffered: "2026-1",
	},
	{
		id: "cc4005",
		name: "Taller de Programación Competitiva",
		code: "CC4005",
		credits: 6,
		description:
			"Resolución de problemas algorítmicos complejos en tiempo limitado. Preparación para competencias como ICPC. Estructuras avanzadas, geometría y programación dinámica.",
		department: "Ciencias de la Computación",
		plan: "electivo_licenciatura",
		categoryTags: ["Algoritmos", "Programación"],
		currentlyOffered: true,
		lastOffered: "2026-1",
	},
	{
		id: "cc4101",
		name: "Lenguajes de Programación",
		code: "CC4101",
		credits: 6,
		description:
			"Paradigmas de programación: funcional, lógico, orientado a objetos. Semántica formal, sistemas de tipos, evaluación perezosa y concurrencia.",
		department: "Ciencias de la Computación",
		plan: "obligatorio",
		categoryTags: ["Lenguajes", "Programación"],
		currentlyOffered: true,
		lastOffered: "2026-1",
	},
	{
		id: "cc4102",
		name: "Diseño y Análisis de Algoritmos",
		code: "CC4102",
		credits: 6,
		description:
			"Técnicas avanzadas de diseño de algoritmos: divide y vencerás, programación dinámica, algoritmos greedy, flujos en redes y algoritmos aleatorizados. Análisis amortizado.",
		department: "Ciencias de la Computación",
		plan: "obligatorio",
		categoryTags: ["Algoritmos", "Teoría"],
		currentlyOffered: true,
		lastOffered: "2026-1",
	},
	{
		id: "cc4302",
		name: "Sistemas Operativos",
		code: "CC4302",
		credits: 6,
		description:
			"Procesos, threads, sincronización, memoria virtual, sistemas de archivos y scheduling. Laboratorios prácticos en C sobre un kernel educativo.",
		department: "Ciencias de la Computación",
		plan: "obligatorio",
		categoryTags: ["Sistemas Operativos", "Programación"],
		currentlyOffered: true,
		lastOffered: "2026-1",
	},
	{
		id: "cc4303",
		name: "Redes",
		code: "CC4303",
		credits: 6,
		description:
			"Arquitectura de redes TCP/IP, protocolos de transporte, capa de aplicación, enrutamiento, seguridad en redes y programación de sockets.",
		department: "Ciencias de la Computación",
		plan: "obligatorio",
		categoryTags: ["Redes"],
		currentlyOffered: true,
		lastOffered: "2026-1",
	},
	{
		id: "cc4401",
		name: "Ingeniería de Software",
		code: "CC4401",
		credits: 6,
		description:
			"Metodologías de desarrollo de software, requisitos, arquitectura, testing, integración continua y gestión de proyectos. Proyecto semestral en equipos.",
		department: "Ciencias de la Computación",
		plan: "obligatorio",
		categoryTags: ["Software Engineering", "Programación"],
		currentlyOffered: true,
		lastOffered: "2026-1",
	},
	{
		id: "cc4402",
		name: "Formulación, Evaluación y Gestión de Proyectos",
		code: "CC4402",
		credits: 6,
		description:
			"Formulación de proyectos TI, análisis de viabilidad, evaluación económica, gestión de riesgos, metodologías ágiles y planificación de recursos.",
		department: "Ciencias de la Computación",
		plan: "obligatorio",
		categoryTags: ["Gestión", "Software Engineering"],
		currentlyOffered: true,
		lastOffered: "2026-1",
	},
	{
		id: "cc5002",
		name: "Desarrollo de Aplicaciones Web",
		code: "CC5002",
		credits: 6,
		description:
			"Desarrollo full-stack moderno: React, Node.js, APIs REST, bases de datos NoSQL y despliegue en la nube. Proyecto grupal semestral con enfoque en sustentabilidad.",
		department: "Ciencias de la Computación",
		plan: "electivo_licenciatura",
		categoryTags: ["Desarrollo Web", "Programación"],
		currentlyOffered: true,
		lastOffered: "2026-1",
	},
	{
		id: "cc5205",
		name: "Minería de Datos",
		code: "CC5205",
		credits: 6,
		description:
			"Técnicas de extracción de conocimiento desde datos: clasificación, clustering, reglas de asociación, reducción de dimensionalidad y evaluación de modelos.",
		department: "Ciencias de la Computación",
		plan: "electivo_especialidad",
		categoryTags: ["Datos", "Machine Learning"],
		currentlyOffered: true,
		lastOffered: "2026-1",
	},
	{
		id: "cc5213",
		name: "Recuperación de Información Multimedia",
		code: "CC5213",
		credits: 6,
		description:
			"Indexación y búsqueda en colecciones multimedia: texto, imágenes, audio y video. Modelos de recuperación, relevance feedback y evaluación de sistemas.",
		department: "Ciencias de la Computación",
		plan: "electivo_especialidad",
		categoryTags: ["Datos", "Algoritmos"],
		currentlyOffered: true,
		lastOffered: "2026-1",
	},
	{
		id: "cc5215",
		name: "Privacidad de Datos",
		code: "CC5215",
		credits: 6,
		description:
			"Privacidad diferencial, anonimización, k-anonimato, mecanismos de privacidad para machine learning y aspectos legales del manejo de datos personales.",
		department: "Ciencias de la Computación",
		plan: "electivo_especialidad",
		categoryTags: ["Datos", "Seguridad"],
		currentlyOffered: true,
		lastOffered: "2026-1",
	},
	{
		id: "cc5303",
		name: "Sistemas Distribuidos",
		code: "CC5303",
		credits: 6,
		description:
			"Fundamentos de sistemas distribuidos: consenso, replicación, tolerancia a fallos, consistencia, RPC, microservicios y sistemas peer-to-peer.",
		department: "Ciencias de la Computación",
		plan: "electivo_especialidad",
		categoryTags: ["Redes", "Sistemas Operativos"],
		currentlyOffered: true,
		lastOffered: "2026-1",
	},
	{
		id: "cc5308",
		name: "Administración de Sistemas Linux",
		code: "CC5308",
		credits: 6,
		description:
			"Administración avanzada de servidores Linux: configuración de servicios, virtualización, contenedores, automatización con Ansible y seguridad de sistemas.",
		department: "Ciencias de la Computación",
		plan: "electivo_especialidad",
		categoryTags: ["Sistemas Operativos", "Redes"],
		currentlyOffered: true,
		lastOffered: "2026-1",
	},
	{
		id: "cc5325",
		name: "Taller de Hacking Competitivo",
		code: "CC5325",
		credits: 6,
		description:
			"Ethical hacking, análisis de vulnerabilidades, explotación de binarios, criptografía aplicada y CTFs. Preparación para competencias de ciberseguridad.",
		department: "Ciencias de la Computación",
		plan: "electivo_especialidad",
		categoryTags: ["Seguridad", "Redes"],
		currentlyOffered: true,
		lastOffered: "2026-1",
	},
	{
		id: "cc5330",
		name: "Ciberseguridad",
		code: "CC5330",
		credits: 6,
		description:
			"Seguridad ofensiva y defensiva, análisis de malware, seguridad en aplicaciones web, criptografía moderna y gestión de incidentes de seguridad.",
		department: "Ciencias de la Computación",
		plan: "electivo_especialidad",
		categoryTags: ["Seguridad"],
		currentlyOffered: true,
		lastOffered: "2026-1",
	},
	{
		id: "cc5401",
		name: "Ingeniería de Software II",
		code: "CC5401",
		credits: 6,
		description:
			"Temas avanzados de ingeniería de software: arquitectura de software, calidad, verificación formal, DevOps, y evolución de sistemas legados.",
		department: "Ciencias de la Computación",
		plan: "electivo_especialidad",
		categoryTags: ["Software Engineering"],
		currentlyOffered: true,
		lastOffered: "2026-1",
	},
	{
		id: "cc5402",
		name: "Proyecto de Software",
		code: "CC5402",
		credits: 12,
		description:
			"Desarrollo de un proyecto de software real para un cliente externo. Aplicación práctica de todo lo aprendido en la carrera en un contexto profesional.",
		department: "Ciencias de la Computación",
		plan: "obligatorio",
		categoryTags: ["Software Engineering", "Gestión"],
		currentlyOffered: true,
		lastOffered: "2026-1",
	},
	{
		id: "cc5408",
		name: "Taller de Diseño y Desarrollo de Videojuegos",
		code: "CC5408",
		credits: 6,
		description:
			"Diseño de juegos, game engines, física de juegos, IA para NPCs, diseño de niveles y narrativa interactiva. Proyecto grupal de desarrollo de un videojuego.",
		department: "Ciencias de la Computación",
		plan: "electivo_licenciatura",
		categoryTags: ["Videojuegos", "Programación"],
		currentlyOffered: true,
		lastOffered: "2026-1",
	},
	{
		id: "cc5409",
		name: "Taller de Videojuegos Multijugador",
		code: "CC5409",
		credits: 6,
		description:
			"Desarrollo de videojuegos multijugador: networking para juegos, sincronización de estado, matchmaking, autoridad de servidor y lag compensation.",
		department: "Ciencias de la Computación",
		plan: "electivo_licenciatura",
		categoryTags: ["Videojuegos", "Redes"],
		currentlyOffered: true,
		lastOffered: "2026-1",
	},
	{
		id: "cc5510",
		name: "Diseño de Sistemas Interactivos",
		code: "CC5510",
		credits: 6,
		description:
			"Diseño y evaluación de sistemas interactivos complejos. User research, design thinking, prototipado avanzado y evaluación con usuarios.",
		department: "Ciencias de la Computación",
		plan: "electivo_licenciatura",
		categoryTags: ["HCI", "Software Engineering"],
		currentlyOffered: true,
		lastOffered: "2026-1",
	},
	{
		id: "cc5602",
		name: "Gestión Informática",
		code: "CC5602",
		credits: 6,
		description:
			"Gestión de proyectos TI, gobierno de TI, ITIL, gestión del cambio, outsourcing y alineamiento estratégico de tecnología con el negocio.",
		department: "Ciencias de la Computación",
		plan: "electivo_especialidad",
		categoryTags: ["Gestión"],
		currentlyOffered: true,
		lastOffered: "2026-1",
	},
	{
		id: "cc5611",
		name: "Ética para Ingenieros en Computación",
		code: "CC5611",
		credits: 3,
		description:
			"Reflexión ética sobre la tecnología: privacidad, sesgo algorítmico, impacto social de la IA, propiedad intelectual del software y responsabilidad profesional.",
		department: "Ciencias de la Computación",
		plan: "electivo_licenciatura",
		categoryTags: ["Gestión"],
		currentlyOffered: true,
		lastOffered: "2026-1",
	},
	{
		id: "cc6205",
		name: "Procesamiento de Lenguaje Natural",
		code: "CC6205",
		credits: 6,
		description:
			"Modelos de lenguaje, embeddings, clasificación de texto, NER, análisis de sentimiento, transformers y aplicaciones de LLMs.",
		department: "Ciencias de la Computación",
		plan: "electivo_especialidad",
		categoryTags: ["NLP", "Machine Learning"],
		currentlyOffered: true,
		lastOffered: "2026-1",
	},
	{
		id: "cc6401",
		name: "Taller de Metodologías Ágiles de Desarrollo de Software",
		code: "CC6401",
		credits: 6,
		description:
			"Scrum, Kanban, XP, pair programming, TDD y continuous delivery en la práctica. Desarrollo ágil de un proyecto real con ceremonias y retrospectivas.",
		department: "Ciencias de la Computación",
		plan: "electivo_especialidad",
		categoryTags: ["Software Engineering", "Gestión"],
		currentlyOffered: true,
		lastOffered: "2026-1",
	},
	{
		id: "cc5118",
		name: "Redes Complejas",
		code: "CC5118",
		credits: 6,
		description:
			"Fundamentos y aplicaciones de redes complejas: redes scale-free, small-world, propagación en redes, detección de comunidades y análisis de redes sociales.",
		department: "Ciencias de la Computación",
		plan: "electivo_especialidad",
		categoryTags: ["Datos", "Algoritmos"],
		currentlyOffered: true,
		lastOffered: "2026-1",
	},
	{
		id: "cc5216",
		name: "Ciencia de Datos Geográficos",
		code: "CC5216",
		credits: 6,
		description:
			"Análisis espacial, sistemas de información geográfica, geodata mining, visualización geoespacial y aplicaciones de datos geográficos.",
		department: "Ciencias de la Computación",
		plan: "electivo_especialidad",
		categoryTags: ["Datos"],
		currentlyOffered: true,
		lastOffered: "2026-1",
	},
	{
		id: "cc7515",
		name: "Computación en GPU",
		code: "CC7515",
		credits: 6,
		description:
			"Programación paralela en GPU con CUDA y OpenCL. Optimización de rendimiento, patrones de paralelismo y aplicaciones en ciencia e ingeniería.",
		department: "Ciencias de la Computación",
		plan: "electivo_especialidad",
		categoryTags: ["Computación Gráfica", "Programación"],
		currentlyOffered: true,
		lastOffered: "2026-1",
	},
];

const reviewComments = [
	"El curso es exigente pero muy bien estructurado. Los auxiliares son increíbles y siempre están disponibles para resolver dudas. Recomendado para quienes quieran aprender de verdad.",
	"Demasiada carga para un semestre normal. Dediqué más tiempo a este ramo que a cualquier otro. Sin embargo, lo que aprendí me ha servido mucho en cursos posteriores.",
	"El profe explica muy bien y hace que temas complejos se entiendan fácil. Las evaluaciones son justas y el material está siempre actualizado.",
	"Las clases son algo aburridas, pero el contenido es fundamental. Estudiar por cuenta propia con los apuntes es la mejor estrategia.",
	"Excelente curso, de los mejores que he tomado en la carrera. El proyecto final es desafiante pero muy satisfactorio cuando lo logras.",
	"El material de apoyo es escaso y las clases van muy rápido. Se necesita mucho estudio autónomo. Aún así, el contenido es valioso.",
	"Me encantó este ramo. El ambiente en clases es muy bueno y la materia es fascinante. Ojalá hubiera más cursos así.",
	"Curso necesario pero pesado. Los controles son difíciles y hay que estar al día con la materia. Recomiendo ir a todas las clases auxiliares.",
	"Buena experiencia general. El trabajo en equipo fue lo mejor del curso, aprendí tanto de mis compañeros como del profe.",
	"El curso cumple su objetivo pero podría mejorar la organización. A veces los plazos de entrega son muy ajustados.",
	"Fundamental para entender lo que viene después. La verdad al principio se sufre, pero después se agradece haberlo tomado.",
	"Contenido interesantísimo y bien presentado. Las clases son dinámicas y el profe siempre trae ejemplos del mundo real.",
	"El sistema de evaluación es justo. Hay bastante trabajo práctico lo cual se agradece. Los laboratorios ayudan mucho a afianzar conceptos.",
	"Ramo intenso pero vale cada minuto. Si te gusta el tema, vas a disfrutar mucho. Si no, prepárate para sufrir un poco.",
	"La cátedra es bastante teórica y a veces se pierde la conexión con lo práctico. Pero los auxiliares compensan con ejercicios muy buenos.",
	"Muy buen electivo. Se aprende bastante y la carga es manejable si te organizas bien desde el principio del semestre.",
	"Las pruebas son más difíciles que lo visto en clases, hay que estudiar mucho material extra. Pero aprendes caleta al final.",
	"Curso entretenido con un proyecto final que realmente simula un ambiente laboral. Me sirvió mucho para mis prácticas profesionales.",
	"El profe es crack, explica con pasión y se nota que domina el tema. La única pega es que avanza rápido y no siempre se puede seguir el ritmo.",
	"Buenísimo para los que les gusta programar. Hay mucho trabajo práctico y los desafíos están bien diseñados.",
];

function generateReviews(cursoId: string, count: number): Review[] {
	const allTags = [
		...Object.values(AXIS_TAGS).flatMap(flattenTags),
		...flattenTags(MODALITY_TAGS),
	];
	const reviews: Review[] = [];
	for (let i = 0; i < count; i++) {
		const year = 2023 + Math.floor(Math.random() * 3);
		const semester = (Math.random() > 0.5 ? 1 : 2) as 1 | 2;
		reviews.push({
			id: Math.floor(Math.random() * 100000),
			cursoId,
			year,
			semester,
			comment:
				reviewComments[Math.floor(Math.random() * reviewComments.length)]!,
			ratings: generateRatings(),
			tags: pick(allTags, Math.floor(Math.random() * 4) + 1),
			likes: Math.floor(Math.random() * 30),
			dislikes: Math.floor(Math.random() * 8),
			funny: Math.floor(Math.random() * 12),
			hidden: false,
			createdAt: new Date(
				2023 + Math.floor(Math.random() * 3),
				Math.floor(Math.random() * 12),
				Math.floor(Math.random() * 28) + 1,
			).toISOString(),
		});
	}
	return reviews.sort(
		(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
	);
}

function aggregateReviewTags(reviews: Review[]): string[] {
	const counts = new Map<string, number>();
	for (const review of reviews) {
		for (const tag of review.tags) {
			counts.set(tag, (counts.get(tag) ?? 0) + 1);
		}
	}
	return [...counts.entries()]
		.filter(([, count]) => count >= 2)
		.sort((a, b) => b[1] - a[1])
		.map(([tag]) => tag)
		.slice(0, 6);
}

function buildCourses(): { courses: Curso[]; reviews: Map<string, Review[]> } {
	const reviewMap = new Map<string, Review[]>();
	const courses = courseDefinitions.map((def) => {
		const reviewCount = Math.floor(Math.random() * 15) + 3;
		const reviews = generateReviews(def.id, reviewCount);
		reviewMap.set(def.id, reviews);
		return {
			...def,
			ratings: generateRatings(),
			reviewCount,
			reviewTags: aggregateReviewTags(reviews),
			semesters: generateSemesters(def.code, def.plan, def.lastOffered),
		};
	});
	return { courses, reviews: reviewMap };
}

const { courses, reviews } = buildCourses();
export const mockCourses: Curso[] = courses;
export const mockReviews: Map<string, Review[]> = reviews;

export const mockUsers: User[] = [
	{
		id: 1,
		name: "Estudiante Demo",
		username: "estudiante",
		role: "stats",
		score: 420,
		createdAt: "2024-03-15T00:00:00Z",
	},
	{
		id: 2,
		name: "Admin Ramitos",
		username: "admin",
		role: "admin",
		score: 0,
		createdAt: "2024-01-01T00:00:00Z",
	},
];

export function getAverageScore(ratings: CourseRatings): number {
	const { docencia, vibes, relevancia } = ratings;
	return Number(((docencia + vibes + relevancia) / 3).toFixed(1));
}

export function toCursoListItem(c: Curso): CursoListItem {
	return {
		id: c.id,
		name: c.name,
		code: c.code,
		credits: c.credits,
		department: c.department,
		plan: c.plan,
		categoryTags: c.categoryTags,
		currentlyOffered: c.currentlyOffered,
		lastOffered: c.lastOffered,
		ratings: c.ratings,
		reviewCount: c.reviewCount,
	};
}

export function getRelatedCourses(
	courseId: string,
	limit = 3,
): CursoListItem[] {
	const course = mockCourses.find((c) => c.id === courseId);
	if (!course) return [];
	const scored = mockCourses
		.filter((c) => c.id !== courseId)
		.map((c) => {
			let score = 0;
			if (c.department === course.department) score += 2;
			score += c.categoryTags.filter((t) =>
				course.categoryTags.includes(t),
			).length;
			if (c.plan === course.plan) score += 1;
			return { course: c, score };
		})
		.sort((a, b) => b.score - a.score)
		.slice(0, limit);
	return scored.map((s) => toCursoListItem(s.course));
}
