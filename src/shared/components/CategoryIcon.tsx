import Code from "@mui/icons-material/Code";
import AccountTree from "@mui/icons-material/AccountTree";
import SmartToy from "@mui/icons-material/SmartToy";
import Psychology from "@mui/icons-material/Psychology";
import Storage from "@mui/icons-material/Storage";
import Language from "@mui/icons-material/Language";
import Memory from "@mui/icons-material/Memory";
import Lock from "@mui/icons-material/Lock";
import Web from "@mui/icons-material/Web";
import Brush from "@mui/icons-material/Brush";
import Architecture from "@mui/icons-material/Architecture";
import BarChart from "@mui/icons-material/BarChart";
import Mouse from "@mui/icons-material/Mouse";
import SportsEsports from "@mui/icons-material/SportsEsports";
import BusinessCenter from "@mui/icons-material/BusinessCenter";
import Functions from "@mui/icons-material/Functions";
import Chat from "@mui/icons-material/Chat";
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
