/**
 * ==========================================
 * THEME: CD ANAKENA (Terminal / CLI)
 * ==========================================
 * VISION:
 * (CD ANAKENA = the computer science department's sports team)
 * Brutalist, raw, and system-level. This theme strips away the UI
 * to reveal the "mainframe" underneath. It should feel like an
 * authentic, high-contrast ZSH/BASH shell environment.
 * * RULES:
 * - Typography: 100% Monospace (JetBrains Mono). No exceptions.
 * - Shapes: STRICTLY 0px border radius. Absolutely no curves.
 * - Colors: Phosphor green on deep black. High contrast only.
 * - Interactions: No smooth transitions. States change instantly.
 * - Vibe: Hacker, cyber-industrial, functional, raw data.
 */

import { createTheme, type ThemeOptions } from "@mui/material/styles";
import TerminalIcon from "@mui/icons-material/Terminal";
import type { ThemeConfig } from "..";

const TOKEN_FONT_FAMILY = '"JetBrains Mono", monospace';
const TOKEN_PHOSPHOR_GREEN = "#33ff00";
const TOKEN_DEEP_BLACK = "#0a0a0a";

const terminalTypography: ThemeOptions["typography"] = {
	fontFamily: TOKEN_FONT_FAMILY,
	h1: {
		fontFamily: TOKEN_FONT_FAMILY,
		textTransform: "uppercase",
		letterSpacing: "0.05em",
		fontWeight: 700,
	},
	h2: {
		fontFamily: TOKEN_FONT_FAMILY,
		textTransform: "uppercase",
		letterSpacing: "0.05em",
		fontWeight: 700,
	},
	h3: {
		fontFamily: TOKEN_FONT_FAMILY,
		textTransform: "uppercase",
		letterSpacing: "0.05em",
		fontWeight: 700,
	},
	h4: {
		fontFamily: TOKEN_FONT_FAMILY,
		textTransform: "uppercase",
		letterSpacing: "0.05em",
		fontWeight: 700,
	},
	h5: {
		fontFamily: TOKEN_FONT_FAMILY,
		textTransform: "uppercase",
		letterSpacing: "0.05em",
		fontWeight: 700,
	},
	h6: {
		fontFamily: TOKEN_FONT_FAMILY,
		textTransform: "uppercase",
		letterSpacing: "0.05em",
		fontWeight: 700,
	},
	subtitle1: { fontFamily: TOKEN_FONT_FAMILY, fontSize: "1.05rem" },
	button: {
		fontFamily: TOKEN_FONT_FAMILY,
		textTransform: "uppercase",
		letterSpacing: "0.1em",
		fontWeight: 700,
	},
	body1: {
		fontFamily: TOKEN_FONT_FAMILY,
		textShadow: "0 0 2px rgba(51, 255, 0, 0.3)",
	},
	body2: { fontFamily: TOKEN_FONT_FAMILY },
	overline: {
		fontFamily: TOKEN_FONT_FAMILY,
		textTransform: "uppercase",
		letterSpacing: "0.2em",
	},
};

const theme = createTheme({
	palette: {
		mode: "dark",
		primary: {
			main: TOKEN_PHOSPHOR_GREEN,
			contrastText: TOKEN_DEEP_BLACK,
		},
		secondary: {
			main: "#ffb000",
			contrastText: TOKEN_DEEP_BLACK,
		},
		background: {
			default: TOKEN_DEEP_BLACK,
			paper: TOKEN_DEEP_BLACK,
		},
		text: {
			primary: TOKEN_PHOSPHOR_GREEN,
			secondary: "#1f521f",
		},
		divider: "#1f521f",
		error: { main: "#ff3333" },
		warning: { main: "#ffb000" },
		success: { main: TOKEN_PHOSPHOR_GREEN },
		info: { main: "#1f521f" },
	},
	typography: terminalTypography,
	shape: { borderRadius: 0 },
	components: {
		MuiCssBaseline: {
			styleOverrides: `
                @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap');
                
                body {
                    background-color: #0a0a0a;
                    color: #33ff00;
                    text-shadow: 0 0 4px rgba(51, 255, 0, 0.4);
                    /* CRT Scanline effect */
                    background-image: 
                        linear-gradient(rgba(10, 10, 10, 0) 50%, rgba(0, 0, 0, 0.25) 50%), 
                        linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
                    background-size: 100% 4px, 3px 100%;
                }
                
                /* Optional retro crosshair cursor */
                * {
                    cursor: crosshair !important;
                }
                
                /* Blinking cursor animation utility */
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                }
            `,
		},
		MuiButton: {
			defaultProps: {
				disableElevation: true,
				disableRipple: true,
			},
			styleOverrides: {
				root: {
					borderRadius: 0,
					border: "1px solid #1f521f",
					backgroundColor: "transparent",
					color: TOKEN_PHOSPHOR_GREEN,
					position: "relative",
					transition: "none", // Remove smooth transitions for hardware feel
					"&:hover": {
						backgroundColor: TOKEN_PHOSPHOR_GREEN,
						color: TOKEN_DEEP_BLACK,
						border: "1px solid #33ff00",
						boxShadow: "0 0 8px rgba(51, 255, 0, 0.6)",
					},
					// Add the bracket syntax to buttons
					"&:before": { content: '"[ "', opacity: 0.7, marginRight: "4px" },
					"&:after": { content: '" ]"', opacity: 0.7, marginLeft: "4px" },
				},
				contained: {
					backgroundColor: "#1f521f",
					"&:hover": {
						backgroundColor: TOKEN_PHOSPHOR_GREEN,
					},
				},
			},
		},
		MuiCard: {
			styleOverrides: {
				root: {
					borderRadius: 0,
					border: "1px solid #1f521f",
					boxShadow: "none",
					backgroundColor: TOKEN_DEEP_BLACK,
					backgroundImage: "none",
				},
			},
		},
		MuiPaper: {
			styleOverrides: {
				root: {
					borderRadius: 0,
					border: "1px solid #1f521f",
					boxShadow: "none",
					backgroundImage: "none",
				},
			},
		},
		MuiAppBar: {
			styleOverrides: {
				root: {
					borderBottom: "1px dashed #1f521f",
					backgroundColor: "#0a0a0a !important",
					backdropFilter: "none",
				},
			},
		},
		MuiOutlinedInput: {
			styleOverrides: {
				root: {
					borderRadius: 0,
					fontFamily: TOKEN_FONT_FAMILY,
					"& .MuiOutlinedInput-notchedOutline": {
						borderColor: "#1f521f",
						borderStyle: "dashed",
					},
					"&:hover .MuiOutlinedInput-notchedOutline": {
						borderColor: TOKEN_PHOSPHOR_GREEN,
					},
					"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
						borderColor: TOKEN_PHOSPHOR_GREEN,
						borderStyle: "solid",
						borderWidth: "1px",
					},
				},
				input: {
					"&::placeholder": { color: "#1f521f", opacity: 1 },
				},
			},
		},
		MuiInputLabel: {
			styleOverrides: {
				root: {
					color: "#1f521f",
					fontFamily: TOKEN_FONT_FAMILY,
					"&.Mui-focused": { color: TOKEN_PHOSPHOR_GREEN },
				},
			},
		},
		MuiDialogTitle: {
			styleOverrides: {
				root: {
					borderBottom: "1px dashed #1f521f",
					paddingBottom: "12px",
				},
			},
		},
		MuiDialogActions: {
			styleOverrides: {
				root: {
					borderTop: "1px dashed #1f521f",
					paddingTop: "12px",
				},
			},
		},
		MuiMenu: {
			styleOverrides: {
				paper: {
					border: "1px solid #33ff00",
				},
			},
		},
		MuiMenuItem: {
			styleOverrides: {
				root: {
					"&.Mui-selected": {
						backgroundColor: "#1f521f",
						color: TOKEN_PHOSPHOR_GREEN,
						"&:before": {
							content: '"> "',
							marginRight: "8px",
							animation: "blink 1s step-end infinite",
						},
					},
					"&:hover": {
						backgroundColor: TOKEN_PHOSPHOR_GREEN,
						color: TOKEN_DEEP_BLACK,
					},
				},
			},
		},
		MuiAlert: {
			styleOverrides: {
				root: {
					borderRadius: 0,
					border: "1px solid",
					fontFamily: TOKEN_FONT_FAMILY,
					"&.MuiAlert-standardError": {
						backgroundColor: "rgba(255, 51, 51, 0.1)",
						color: "#ff3333",
						borderColor: "#ff3333",
						"& .MuiAlert-icon": { color: "#ff3333" },
					},
				},
			},
		},
	},
});

export const anakenaTheme: ThemeConfig = {
	id: "anakena",
	name: "cd anakena",
	theme: theme,
	icon: {
		type: "mui",
		component: TerminalIcon,
		color: TOKEN_PHOSPHOR_GREEN,
	},
	label: {
		fontFamily: TOKEN_FONT_FAMILY,
		background: TOKEN_DEEP_BLACK,
		color: TOKEN_PHOSPHOR_GREEN,
	},
};
