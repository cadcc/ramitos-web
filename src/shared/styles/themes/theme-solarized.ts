/**
 * ==========================================
 * THEME: Light (Default)
 * ==========================================
 * VISION:
 * Clean, warm, and highly legible. Inspired by Solarized Light,
 * it uses soft paper-like backgrounds (#FDF6E3) rather than harsh
 * pure whites to reduce eye strain.
 * * RULES:
 * - Typography: Figtree for body, Space Grotesk for bold headers.
 * - Shapes: Gentle curves (8px to 10px border radius).
 * - Shadows: Extremely subtle, soft drop shadows for elevation.
 * - Vibe: Modern, professional, inviting, and academic.
 */

/**
 * ==========================================
 * THEME: Dark
 * ==========================================
 * VISION:
 * Deep, immersive, and focused. Inspired by Solarized Dark,
 * it relies on oceanic dark blues and teals (#002B36) instead of
 * flat grays or pure blacks, giving it a rich, premium feel.
 * * RULES:
 * - Typography: Figtree for body, Space Grotesk for bold headers.
 * - Contrast: Use muted text for secondary info to avoid glowing text fatigue.
 * - Borders: Use low-opacity borders (rgba) to define edges seamlessly.
 * - Vibe: "Late night coding session" — easy on the eyes, sleek, distraction-free.
 */

import type { ThemeConfig } from "..";
import { createTheme, type ThemeOptions } from "@mui/material/styles";
import { DarkModeRounded, PrintRounded } from "@mui/icons-material";

const TOKEN_TITLE_FONT_FAMILY = '"Space Grotesk", sans-serif';
const TOKEN_DARK_CONTENT = "#073642";
const TOKEN_LIGHT_CONTENT = "#FDF6E3";
const TOKEN_PRIMARY_LIGHTER = "#4DA3E0";
const TOKEN_PRIMARY_DARKER = "#1A6BA8";

const sharedTypography: ThemeOptions["typography"] = {
	fontFamily: '"Figtree", sans-serif',
	h1: {
		fontFamily: TOKEN_TITLE_FONT_FAMILY,
		fontWeight: 700,
		letterSpacing: "-0.03em",
	},
	h2: {
		fontFamily: TOKEN_TITLE_FONT_FAMILY,
		fontWeight: 700,
		letterSpacing: "-0.02em",
	},
	h3: {
		fontFamily: TOKEN_TITLE_FONT_FAMILY,
		fontWeight: 700,
		letterSpacing: "-0.02em",
	},
	h4: {
		fontFamily: TOKEN_TITLE_FONT_FAMILY,
		fontWeight: 600,
		letterSpacing: "-0.01em",
	},
	h5: {
		fontFamily: TOKEN_TITLE_FONT_FAMILY,
		fontWeight: 600,
	},
	h6: {
		fontFamily: TOKEN_TITLE_FONT_FAMILY,
		fontWeight: 600,
	},
	subtitle1: {
		fontSize: "1.05rem",
		fontWeight: 500,
	},
	button: {
		fontWeight: 600,
		letterSpacing: "0.01em",
		textTransform: "none" as const,
	},
	overline: {
		fontFamily: TOKEN_TITLE_FONT_FAMILY,
		fontWeight: 700,
		letterSpacing: "0.08em",
	},
};

const sharedComponents: ThemeOptions["components"] = {
	MuiButton: {
		styleOverrides: {
			root: {
				borderRadius: 8,
				padding: "7px 18px",
				fontSize: "0.875rem",
			},
			sizeSmall: {
				padding: "5px 14px",
				fontSize: "0.8rem",
			},
		},
		defaultProps: {
			disableElevation: true,
		},
	},
	MuiCard: {
		styleOverrides: {
			root: {
				borderRadius: 10,
			},
		},
	},
	MuiChip: {
		styleOverrides: {
			root: {
				borderRadius: 6,
				fontWeight: 500,
			},
		},
	},
	MuiPaper: {
		styleOverrides: {
			root: {
				borderRadius: 10,
			},
		},
	},
};

const solarizedLightTheme = createTheme({
	palette: {
		mode: "light",
		primary: {
			main: "#268BD2",
			light: "#4DA3E0",
			dark: "#1A6BA8",
			contrastText: TOKEN_LIGHT_CONTENT,
		},
		secondary: {
			main: "#D33682",
			light: "#DC5A9A",
			dark: "#A82968",
			contrastText: TOKEN_LIGHT_CONTENT,
		},
		background: {
			default: TOKEN_LIGHT_CONTENT,
			paper: "#FFFCF0",
		},
		text: {
			primary: TOKEN_DARK_CONTENT,
			secondary: "#586E75",
		},
		divider: "#EEE8D5",
		error: { main: "#DC322F" },
		warning: { main: "#CB4B16" },
		success: { main: "#859900" },
		info: { main: "#268BD2" },
	},
	typography: sharedTypography,
	components: {
		...sharedComponents,
		MuiCssBaseline: {
			styleOverrides: {
				body: {
					backgroundColor: TOKEN_LIGHT_CONTENT,
				},
			},
		},
		MuiCard: {
			styleOverrides: {
				root: {
					borderRadius: 10,
					border: "1px solid #EEE8D5",
					boxShadow: "0 1px 3px rgba(7,54,66,0.04)",
				},
			},
		},
	},
	shape: { borderRadius: 8 },
});

const solarizedDarkTheme = createTheme({
	palette: {
		mode: "dark",
		primary: {
			main: "#268BD2",
			light: "#4DA3E0",
			dark: "#1A6BA8",
			contrastText: TOKEN_LIGHT_CONTENT,
		},
		secondary: {
			main: "#D33682",
			light: "#DC5A9A",
			dark: "#A82968",
			contrastText: "#002B36",
		},
		background: {
			default: "#002B36",
			paper: TOKEN_DARK_CONTENT,
		},
		text: {
			primary: TOKEN_LIGHT_CONTENT,
			secondary: "#93A1A1",
		},
		divider: "rgba(238,232,213,0.1)",
		error: { main: "#DC322F" },
		warning: { main: "#CB4B16" },
		success: { main: "#859900" },
		info: { main: "#268BD2" },
	},
	typography: sharedTypography,
	components: {
		...sharedComponents,
		MuiCssBaseline: {
			styleOverrides: {
				body: {
					backgroundColor: "#002B36",
				},
			},
		},
		MuiCard: {
			styleOverrides: {
				root: {
					borderRadius: 10,
					border: "1px solid rgba(238,232,213,0.08)",
					boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
				},
			},
		},
	},
	shape: { borderRadius: 8 },
});

export const lightTheme: ThemeConfig = {
	id: "light",
	name: "toqui",
	theme: solarizedLightTheme,
	icon: {
		type: "mui",
		component: PrintRounded,
		color: TOKEN_PRIMARY_DARKER,
	},
	label: {
		fontFamily: TOKEN_TITLE_FONT_FAMILY,
		background: TOKEN_LIGHT_CONTENT,
		color: TOKEN_DARK_CONTENT,
	},
};

export const darkTheme: ThemeConfig = {
	id: "dark",
	name: "salita",
	theme: solarizedDarkTheme,
	icon: {
		type: "mui",
		component: DarkModeRounded,
		color: TOKEN_PRIMARY_LIGHTER,
	},
	label: {
		fontFamily: TOKEN_TITLE_FONT_FAMILY,
		background: TOKEN_DARK_CONTENT,
		color: TOKEN_LIGHT_CONTENT,
	},
};
