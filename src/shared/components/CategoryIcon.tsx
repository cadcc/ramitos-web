import {
	Code,
	AccountTree,
	SmartToy,
	Psychology,
	Storage,
	Language,
	Memory,
	Lock,
	Web,
	Brush,
	Architecture,
	BarChart,
	Mouse,
	SportsEsports,
	BusinessCenter,
	Functions,
	Chat,
} from "@mui/icons-material";
import { SvgIcon } from "@mui/material";
import type { SvgIconProps } from "@mui/material";
import type { ComponentType } from "react";

function LambdaIcon(props: SvgIconProps) {
	return (
		<SvgIcon {...props} viewBox="0 0 24 24">
			<svg
				stroke="currentColor"
				fill="none"
				stroke-width="2"
				viewBox="0 0 24 24"
				stroke-linecap="round"
				stroke-linejoin="round"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path d="M6 20l6.5 -9"></path>
				<path d="M19 20c-6 0 -6 -16 -12 -16"></path>
			</svg>
		</SvgIcon>
	);
}

const iconMap: Record<string, ComponentType<SvgIconProps>> = {
	Programación: Code,
	Algoritmos: AccountTree,
	"Inteligencia Artificial": SmartToy,
	"Machine Learning": Psychology,
	"Bases de Datos": Storage,
	Redes: Language,
	"Sistemas Operativos": Memory,
	Seguridad: Lock,
	"Desarrollo Web": Web,
	"Computación Gráfica": Brush,
	"Software Engineering": Architecture,
	Lenguajes: LambdaIcon,
	Datos: BarChart,
	HCI: Mouse,
	Videojuegos: SportsEsports,
	Gestión: BusinessCenter,
	Teoría: Functions,
	NLP: Chat,
};

export default function CategoryIcon({
	category,
	...props
}: { category: string } & SvgIconProps) {
	const Icon = iconMap[category];
	if (!Icon) return null;
	return <Icon {...props} />;
}
