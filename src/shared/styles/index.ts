import type { Theme } from "@mui/material/styles";
import { darkTheme, lightTheme } from "./themes/theme-solarized";
import { anakenaTheme } from "./themes/theme-anakena";
import { cadccTheme } from "./themes/theme-cadcc";
import { retroTheme } from "./themes/theme-retro";

export interface ThemeConfig {
	id: string;
	name: string;
	theme: Theme;
	// future: iconsets? descriptions? unlock codes?
}

export const appThemes = {
	light: {
		id: "light",
		name: "Toqui",
		theme: lightTheme,
	},
	dark: {
		id: "dark",
		name: "Oscuro",
		theme: darkTheme,
	},
	anakena: {
		id: "anakena",
		name: "Anakena",
		theme: anakenaTheme,
	},
	retro: {
		id: "retro",
		name: "Retro",
		theme: retroTheme,
	},
	cadcc: {
		id: "cadcc",
		name: "CaDCC",
		theme: cadccTheme,
	},
} satisfies Record<string, ThemeConfig>;

export type ThemeKey = keyof typeof appThemes;
