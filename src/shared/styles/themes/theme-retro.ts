/**
 * ==========================================
 * THEME: 90s Retro / Web 1.0
 * ==========================================
 * VISION:
 * The authentic "ugly-cool" charm of 1997. Think Windows 95,
 * GeoCities, and early internet optimism. It rejects modern minimalism
 * in favor of maximum visual impact and structural rigidity.
 * * RULES:
 * - Shapes: STRICTLY 0px border radius.
 * - Depth: Rely exclusively on 4-value CSS borders to create Outset/Inset 3D bevels.
 * - Colors: Pure, saturated system colors (pure blue, hot red, silver/gray).
 * - Typography: System fonts only (MS Sans Serif, Arial Black).
 * - Vibe: Nostalgic, chaotic, loud, and unapologetically dated.
 */

import { createTheme, type ThemeOptions } from "@mui/material/styles";

const retroTypography: ThemeOptions["typography"] = {
	fontFamily:
		'"MS Sans Serif", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
	h1: {
		fontFamily: '"Arial Black", Impact, Haettenschweiler, sans-serif',
		textTransform: "uppercase",
		fontWeight: 900,
		letterSpacing: "0.02em",
	},
	h2: {
		fontFamily: '"Arial Black", Impact, Haettenschweiler, sans-serif',
		textTransform: "uppercase",
		fontWeight: 900,
	},
	h3: {
		fontFamily: '"Arial Black", Impact, Haettenschweiler, sans-serif',
		fontWeight: 900,
	},
	h4: {
		fontFamily: '"Arial Black", Impact, Haettenschweiler, sans-serif',
		fontWeight: 900,
	},
	h5: { fontWeight: 700 },
	h6: { fontWeight: 700 },
	subtitle1: { fontWeight: 700 },
	button: {
		fontFamily:
			'"MS Sans Serif", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
		textTransform: "uppercase",
		letterSpacing: "0.05em",
		fontWeight: 700,
	},
	body1: { fontSize: "16px", color: "#000000" },
	body2: { fontSize: "14px", color: "#000000" },
	overline: {
		fontFamily: '"Courier New", Courier, monospace',
		fontWeight: 700,
	},
};

export const retroTheme = createTheme({
	palette: {
		mode: "light",
		primary: {
			main: "#0000FF", // Pure Blue
			contrastText: "#FFFFFF",
		},
		secondary: {
			main: "#FF0000", // Hot Red
			contrastText: "#FFFFFF",
		},
		background: {
			default: "#C0C0C0", // Windows Gray
			paper: "#C0C0C0",
		},
		text: {
			primary: "#000000",
			secondary: "#808080",
		},
		divider: "#808080",
		error: { main: "#FF0000" },
		warning: { main: "#FFFF00" },
		success: { main: "#00FF00" },
		info: { main: "#000080" },
	},
	typography: retroTypography,
	shape: { borderRadius: 0 },
	transitions: {
		// 90s web didn't have smooth transitions. Everything is instant.
		create: () => "none",
	},
	components: {
		MuiCssBaseline: {
			styleOverrides: `
                body {
                    background-color: #c0c0c0;
                    color: #000000;
                    /* 90s Tiled Pattern */
                    background-image: 
                        linear-gradient(45deg, #b8b8b8 25%, transparent 25%), 
                        linear-gradient(-45deg, #b8b8b8 25%, transparent 25%), 
                        linear-gradient(45deg, transparent 75%, #b8b8b8 75%), 
                        linear-gradient(-45deg, transparent 75%, #b8b8b8 75%);
                    background-size: 4px 4px;
                    background-position: 0 0, 0 2px, 2px -2px, -2px 0px;
                }

                /* Focus styles for keyboard accessibility (Windows 95 style) */
                *:focus-visible {
                    outline: 2px dotted #000000 !important;
                    outline-offset: 2px !important;
                }

                /* Rainbow Animation for custom classes */
                @keyframes rainbow {
                    0% { color: #ff0000; }
                    17% { color: #ff8000; }
                    33% { color: #ffff00; }
                    50% { color: #00ff00; }
                    67% { color: #0080ff; }
                    83% { color: #8000ff; }
                    100% { color: #ff0000; }
                }
                .text-rainbow {
                    animation: rainbow 4s linear infinite;
                }

                /* Horizontal Rule Groove */
                hr.groove {
                    border: none;
                    height: 4px;
                    background: linear-gradient(to bottom, #808080 0%, #808080 50%, #ffffff 50%, #ffffff 100%);
                    margin: 16px 0;
                }
            `,
		},
		MuiButton: {
			defaultProps: {
				disableElevation: true,
				disableRipple: true, // No ripples in 1997!
			},
			styleOverrides: {
				root: {
					borderRadius: 0,
					border: "2px solid",
					borderColor: "#ffffff #808080 #808080 #ffffff",
					boxShadow: "inset -1px -1px 0 #404040, inset 1px 1px 0 #dfdfdf",
					backgroundColor: "#C0C0C0",
					color: "#000000",
					padding: "6px 16px",
					"&:hover": {
						backgroundColor: "#E8E8E8",
					},
					"&:active": {
						borderColor: "#808080 #ffffff #ffffff #808080",
						boxShadow: "inset 1px 1px 0 #404040, inset -1px -1px 0 #dfdfdf",
						transform: "translate(1px, 1px)",
					},
					"&.MuiButton-containedPrimary": {
						backgroundColor: "#0000FF",
						color: "#FFFFFF",
						borderColor: "#5555ff #000080 #000080 #5555ff",
						"&:hover": { backgroundColor: "#3333FF" },
					},
					"&.MuiButton-containedSecondary": {
						backgroundColor: "#FF0000",
						color: "#FFFFFF",
						borderColor: "#ff5555 #800000 #800000 #ff5555",
						"&:hover": { backgroundColor: "#FF3333" },
					},
				},
			},
		},
		MuiAppBar: {
			styleOverrides: {
				root: {
					background: "linear-gradient(to right, #000080, #1084d0)", // Windows Title Bar Gradient
					color: "#FFFFFF",
					border: "2px solid",
					borderColor: "#ffffff #808080 #808080 #ffffff",
					boxShadow: "none",
				},
			},
		},
		MuiToolbar: {
			styleOverrides: {
				root: {
					minHeight: "40px !important", // Tighter title bars
				},
			},
		},
		MuiCard: {
			styleOverrides: {
				root: {
					borderRadius: 0,
					backgroundColor: "#C0C0C0",
					border: "2px solid",
					borderColor: "#ffffff #808080 #808080 #ffffff",
					boxShadow: "none",
				},
			},
		},
		MuiPaper: {
			styleOverrides: {
				root: {
					borderRadius: 0,
					backgroundColor: "#C0C0C0",
					border: "2px solid",
					borderColor: "#ffffff #808080 #808080 #ffffff",
					boxShadow: "none",
				},
			},
		},
		MuiOutlinedInput: {
			styleOverrides: {
				root: {
					borderRadius: 0,
					backgroundColor: "#FFFFFF",
					border: "2px solid",
					borderColor: "#808080 #ffffff #ffffff #808080", // Inset Bevel for inputs
					boxShadow: "inset 1px 1px 0 #404040, inset -1px -1px 0 #dfdfdf",
					"& .MuiOutlinedInput-notchedOutline": {
						border: "none", // Kill MUI's default outline so our custom border shows
					},
					"&.Mui-focused": {
						outline: "2px dotted #000000",
						outlineOffset: "2px",
					},
				},
			},
		},
		MuiInputLabel: {
			styleOverrides: {
				root: {
					color: "#000000",
					fontWeight: "bold",
					"&.Mui-focused": { color: "#000000" },
				},
			},
		},
		MuiLink: {
			styleOverrides: {
				root: {
					color: "#0000FF",
					textDecoration: "underline",
					"&:visited": { color: "#800080" },
					"&:hover": { color: "#FF0000" },
					"&:active": { color: "#FF0000" },
				},
			},
		},
		MuiDialogTitle: {
			styleOverrides: {
				root: {
					background: "linear-gradient(to right, #000080, #1084d0)",
					color: "#FFFFFF",
					padding: "4px 8px",
					fontSize: "1rem",
					fontWeight: 900,
					fontFamily: '"MS Sans Serif", "Segoe UI", sans-serif',
				},
			},
		},
		MuiDialogContent: {
			styleOverrides: {
				root: {
					backgroundColor: "#C0C0C0",
					padding: "16px",
					borderTop: "2px solid #ffffff",
					borderLeft: "2px solid #ffffff",
				},
			},
		},
		MuiDialogActions: {
			styleOverrides: {
				root: {
					backgroundColor: "#C0C0C0",
					padding: "16px",
				},
			},
		},
		MuiMenu: {
			styleOverrides: {
				paper: {
					border: "2px solid",
					borderColor: "#ffffff #808080 #808080 #ffffff",
					boxShadow: "2px 2px 0px rgba(0,0,0,0.5)", // The only acceptable drop shadow in Windows 95
				},
			},
		},
		MuiMenuItem: {
			styleOverrides: {
				root: {
					color: "#000000",
					"&:hover": {
						backgroundColor: "#000080",
						color: "#FFFFFF",
					},
					"&.Mui-selected": {
						backgroundColor: "#000080",
						color: "#FFFFFF",
						"&:hover": {
							backgroundColor: "#000080",
						},
					},
				},
			},
		},
		MuiAlert: {
			styleOverrides: {
				root: {
					borderRadius: 0,
					border: "2px solid",
					borderColor: "#ffffff #808080 #808080 #ffffff",
					color: "#000000",
					"&.MuiAlert-standardError": {
						backgroundColor: "#FF0000",
						color: "#FFFFFF",
						borderColor: "#ff5555 #800000 #800000 #ff5555",
						"& .MuiAlert-icon": { color: "#FFFFFF" },
					},
				},
			},
		},
	},
});
