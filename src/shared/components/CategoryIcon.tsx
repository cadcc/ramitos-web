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
			<path
				d="M4.5 20h4l3-7.5L16.5 20H21l-7-16h-4l3 6.5L7 20H4.5z"
				fill="currentColor"
			/>
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
