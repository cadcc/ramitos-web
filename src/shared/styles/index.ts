import type { Theme } from "@mui/material/styles";
import { darkTheme, lightTheme } from "./themes/theme-solarized";
import { anakenaTheme } from "./themes/theme-anakena";
import { cadccTheme } from "./themes/theme-cadcc";
import { retroTheme } from "./themes/theme-retro";
import type { ComponentType } from "react";
import type { SvgIconProps } from "@mui/material";

interface MuiIconConfig {
	type: "mui";
	component: ComponentType<SvgIconProps>;
	color: string;
}

interface ImageIconConfig {
	type: "image";
	url: string;
}

export interface ThemeConfig {
	id: string;
	name: string;
	theme: Theme;
	icon: MuiIconConfig | ImageIconConfig;
	label: {
		fontFamily: string;
		background: string;
		color: string;
	};
	// TODO: (future) iconsets
}

export const appThemes = {
	light: lightTheme,
	dark: darkTheme,
	retro: retroTheme,
	anakena: anakenaTheme,
	cadcc: cadccTheme,
} satisfies Record<string, ThemeConfig>;

export type ThemeKey = keyof typeof appThemes;
