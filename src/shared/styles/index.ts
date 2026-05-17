import type { Theme } from "@mui/material/styles";
import { darkTheme, lightTheme } from "./themes/theme-solarized";
import { anakenaTheme } from "./themes/theme-anakena";
import { cadccTheme } from "./themes/theme-cadcc";
import { retroTheme } from "./themes/theme-retro";
import type { ComponentType } from "react";
import type { SvgIconProps } from "@mui/material";
import { bubblegumTheme } from "./themes/theme-bubblegum";
import { minimalDarkTheme, minimalLightTheme } from "./themes/theme-minimal";

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
    minimalLight: minimalLightTheme, // eniac light
	cadcc: cadccTheme, // ofisalita light
	light: lightTheme, // toqui light
    bubblegum: bubblegumTheme, // kioskito light
	retro: retroTheme, // sistemas light
	dark: darkTheme, // salita dark
	anakena: anakenaTheme, // anakena dark
    minimalDark: minimalDarkTheme, // lorenzo dark
} satisfies Record<string, ThemeConfig>;

export type ThemeKey = keyof typeof appThemes;
