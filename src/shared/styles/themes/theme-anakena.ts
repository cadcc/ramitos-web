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
 * - Colors: Phosphor green (#33ff00) on deep black. High contrast only.
 * - Interactions: No smooth transitions. States change instantly.
 * - Vibe: Hacker, cyber-industrial, functional, raw data.
 */

import { createTheme, type ThemeOptions } from "@mui/material/styles";

const terminalTypography: ThemeOptions["typography"] = {
	fontFamily: '"JetBrains Mono", "Fira Code", monospace',
	h1: {
		fontFamily: '"JetBrains Mono", monospace',
		textTransform: "uppercase",
		letterSpacing: "0.05em",
		fontWeight: 700,
	},
	h2: {
		fontFamily: '"JetBrains Mono", monospace',
		textTransform: "uppercase",
		letterSpacing: "0.05em",
		fontWeight: 700,
	},
	h3: {
		fontFamily: '"JetBrains Mono", monospace',
		textTransform: "uppercase",
		letterSpacing: "0.05em",
		fontWeight: 700,
	},
	h4: {
		fontFamily: '"JetBrains Mono", monospace',
		textTransform: "uppercase",
		letterSpacing: "0.05em",
		fontWeight: 700,
	},
	h5: {
		fontFamily: '"JetBrains Mono", monospace',
		textTransform: "uppercase",
		letterSpacing: "0.05em",
		fontWeight: 700,
	},
	h6: {
		fontFamily: '"JetBrains Mono", monospace',
		textTransform: "uppercase",
		letterSpacing: "0.05em",
		fontWeight: 700,
	},
	subtitle1: { fontFamily: '"JetBrains Mono", monospace', fontSize: "1.05rem" },
	button: {
		fontFamily: '"JetBrains Mono", monospace',
		textTransform: "uppercase",
		letterSpacing: "0.1em",
		fontWeight: 700,
	},
	body1: {
		fontFamily: '"JetBrains Mono", monospace',
		textShadow: "0 0 2px rgba(51, 255, 0, 0.3)",
	},
	body2: { fontFamily: '"JetBrains Mono", monospace' },
	overline: {
		fontFamily: '"JetBrains Mono", monospace',
		textTransform: "uppercase",
		letterSpacing: "0.2em",
	},
};

export const anakenaTheme = createTheme({
	palette: {
		mode: "dark",
		primary: {
			main: "#33ff00",
			contrastText: "#0a0a0a",
		},
		secondary: {
			main: "#ffb000",
			contrastText: "#0a0a0a",
		},
		background: {
			default: "#0a0a0a",
			paper: "#0a0a0a",
		},
		text: {
			primary: "#33ff00",
			secondary: "#1f521f",
		},
		divider: "#1f521f",
		error: { main: "#ff3333" },
		warning: { main: "#ffb000" },
		success: { main: "#33ff00" },
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
					color: "#33ff00",
					position: "relative",
					transition: "none", // Remove smooth transitions for hardware feel
					"&:hover": {
						backgroundColor: "#33ff00",
						color: "#0a0a0a",
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
						backgroundColor: "#33ff00",
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
					backgroundColor: "#0a0a0a",
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
					fontFamily: '"JetBrains Mono", monospace',
					"& .MuiOutlinedInput-notchedOutline": {
						borderColor: "#1f521f",
						borderStyle: "dashed",
					},
					"&:hover .MuiOutlinedInput-notchedOutline": {
						borderColor: "#33ff00",
					},
					"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
						borderColor: "#33ff00",
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
					fontFamily: '"JetBrains Mono", monospace',
					"&.Mui-focused": { color: "#33ff00" },
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
						color: "#33ff00",
						"&:before": {
							content: '"> "',
							marginRight: "8px",
							animation: "blink 1s step-end infinite",
						},
					},
					"&:hover": {
						backgroundColor: "#33ff00",
						color: "#0a0a0a",
					},
				},
			},
		},
		MuiAlert: {
			styleOverrides: {
				root: {
					borderRadius: 0,
					border: "1px solid",
					fontFamily: '"JetBrains Mono", monospace',
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
