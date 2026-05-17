/**
 * ==========================================
 * THEME: CaDCC (Centro de Alumnos)
 * ==========================================
 * VISION:
 * "Student-Org Pop" or "Playful Geometric". It feels like a tactile
 * sticker book—friendly, highly energetic, and optimistic. It uses
 * heavy strokes and solid colors to create a comic-pop aesthetic.
 * * RULES:
 * - Typography: Bubbly and round (Comfortaa headers, Nunito body).
 * - Shapes: Maximum roundness. Pill-shaped buttons and 16px/24px cards.
 * - Depth: Hard, solid-color offset shadows (e.g., 4px 4px 0px). NEVER blur.
 * - Interactions: Bouncy, elastic, and springy hover/active states.
 * - Vibe: Welcoming, tactile, fun, pop-art.
 */
// TODO: add the shine/swoosh

import { createTheme, type ThemeOptions } from "@mui/material/styles";
import type { ThemeConfig } from "..";

const cadccColors = {
	green: "#00ada0",
	blue: "#2c5aa0",
	pink: "#ff2a7f",
	yellow: "#ffd91e",
	violet: "#1a0856",
	gray: "#606898",
	black: "#111111",
	background: "#e2e4f3",
	lines: "#1f1954",
};

const TOKEN_COMFORTAA = '"Comfortaa", cursive';

const hardShadow = `4px 4px 0px ${cadccColors.lines}`;
const hardShadowHover = `6px 6px 0px ${cadccColors.lines}`;
const hardShadowCard = `8px 8px 0px ${cadccColors.lines}`;

const cadccTypography: ThemeOptions["typography"] = {
	fontFamily: '"Nunito", sans-serif',
	h1: {
		fontFamily: TOKEN_COMFORTAA,
		fontWeight: 700,
		color: cadccColors.violet,
		fontSize: "2rem",
	},
	h2: {
		fontFamily: TOKEN_COMFORTAA,
		fontWeight: 700,
		color: cadccColors.violet,
		fontSize: "1.5rem",
	},
	h3: {
		fontFamily: TOKEN_COMFORTAA,
		fontWeight: 700,
		color: cadccColors.violet,
		fontSize: "1.25rem",
	},
	h4: {
		fontFamily: TOKEN_COMFORTAA,
		fontWeight: 700,
		color: cadccColors.violet,
		fontSize: "1.1rem",
	},
	h5: {
		fontFamily: TOKEN_COMFORTAA,
		fontWeight: 700,
		color: cadccColors.violet,
	},
	h6: {
		fontFamily: TOKEN_COMFORTAA,
		fontWeight: 700,
		color: cadccColors.violet,
	},
	subtitle1: { fontWeight: 700, color: cadccColors.gray },
	button: {
		fontFamily: TOKEN_COMFORTAA,
		fontWeight: 700,
		textTransform: "none",
		fontSize: "1rem",
	},
	body1: { color: "#040115", fontWeight: 500 },
	body2: { color: "#040115", fontWeight: 500 },
};

const theme = createTheme({
	palette: {
		mode: "light",
		primary: { main: cadccColors.blue, contrastText: "#ffffff" },
		secondary: { main: cadccColors.pink, contrastText: "#ffffff" },
		background: { default: cadccColors.background, paper: "#ffffff" },
		text: { primary: "#040115", secondary: cadccColors.gray },
		divider: cadccColors.lines,
		error: { main: cadccColors.pink },
		warning: { main: cadccColors.yellow },
		success: { main: cadccColors.green },
		info: { main: cadccColors.blue },
	},
	typography: cadccTypography,
	shape: { borderRadius: 16 },
	components: {
		MuiCssBaseline: {
			styleOverrides: `
                /* We rely on index.html for the font imports now! */
                body {
                    background-color: ${cadccColors.background};
                    color: #040115;
                }
                
                /* Custom CaDCC Link Styles */
                a {
                    color: ${cadccColors.blue};
                    font-weight: 700;
                    text-decoration: none;
                    transition: color 0.2s ease;
                }
                a:hover {
                    color: ${cadccColors.pink};
                }

                /* CaDCC Utility Underlines */
                .underline-blue {
                    position: relative;
                }
                .underline-blue::before {
                    content: "";
                    position: absolute;
                    left: 0;
                    top: 85%;
                    width: 100%;
                    height: 4px;
                    border-radius: 2px;
                    background-color: ${cadccColors.blue};
                    background-size: 8px 8px;
                    background-image: repeating-linear-gradient(to right, transparent, transparent 6px, rgba(255, 255, 255, 0.4) 6px, rgba(255, 255, 255, 0.4));
                }
                .underline-green {
                    position: relative;
                }
                .underline-green::before {
                    content: "";
                    position: absolute;
                    left: 0;
                    top: 85%;
                    width: 100%;
                    height: 4px;
                    border-radius: 2px;
                    background-color: ${cadccColors.green};
                    background-size: 7px 7px;
                    background-image: repeating-linear-gradient(to right, transparent, transparent 5px, rgba(255, 255, 255, 0.4) 5px, rgba(255, 255, 255, 0.4));
                }
            `,
		},
		MuiButton: {
			defaultProps: { disableElevation: true },
			styleOverrides: {
				root: {
					borderRadius: 16, // Changed from 9999 to 16 to fix multi-line ovals
					border: `2px solid ${cadccColors.lines}`,
					padding: "8px 24px",
					transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
					boxShadow: hardShadow,
					"&:hover": {
						transform: "translate(-2px, -2px)",
						boxShadow: hardShadowHover,
					},
					"&:active": {
						transform: "translate(2px, 2px)",
						boxShadow: `0px 0px 0px ${cadccColors.lines}`,
					},
					"&.MuiButton-containedPrimary": {
						backgroundColor: cadccColors.blue,
						color: "#ffffff",
						"&:hover": { backgroundColor: "#3a70c4" },
					},
					"&.MuiButton-containedSecondary": {
						backgroundColor: cadccColors.pink,
						color: "#ffffff",
						"&:hover": { backgroundColor: "#ff4d94" },
					},
					"&.MuiButton-outlined": {
						backgroundColor: "#ffffff",
						color: cadccColors.violet,
						"&:hover": { backgroundColor: cadccColors.yellow },
					},
				},
			},
		},
		MuiCard: {
			styleOverrides: {
				root: {
					borderRadius: 16,
					border: `2px solid ${cadccColors.lines}`,
					boxShadow: hardShadowCard,
					overflow: "visible",
					transition: "transform 0.2s ease",
					"&:hover": {
						transform: "rotate(-1deg) scale(1.01)",
					},
				},
			},
		},
		MuiPaper: {
			styleOverrides: {
				root: {
					borderRadius: 16,
					border: `2px solid ${cadccColors.lines}`,
					boxShadow: hardShadow,
				},
			},
		},
		MuiAppBar: {
			styleOverrides: {
				root: {
					backgroundColor: "#ffffff !important",
					color: cadccColors.violet,
					borderBottom: `2px solid ${cadccColors.lines}`,
					borderTop: "none", // Fixes the floating look
					borderLeft: "none",
					borderRight: "none",
					borderRadius: 0, // Overrides the global MuiPaper 16px radius
					boxShadow: "none",
				},
			},
		},
		MuiOutlinedInput: {
			styleOverrides: {
				root: {
					borderRadius: 12,
					backgroundColor: "#ffffff",
					boxShadow: "none",
					transition: "all 0.2s ease",
					// Apply border color changes to the notched outline instead of root
					"&:hover .MuiOutlinedInput-notchedOutline": {
						borderColor: cadccColors.blue,
					},
					"&.Mui-focused": {
						boxShadow: `4px 4px 0px ${cadccColors.blue}`,
						transform: "translate(-2px, -2px)",
					},
					"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
						borderColor: cadccColors.blue,
						borderWidth: 2,
					},
				},
				// Style the notch so labels can properly cut through the border
				notchedOutline: {
					borderColor: cadccColors.gray,
					borderWidth: 2,
				},
			},
		},
		MuiAlert: {
			styleOverrides: {
				root: {
					borderRadius: 8,
					borderLeft: "5px solid",
					borderTop: `2px solid ${cadccColors.lines}`,
					borderRight: `2px solid ${cadccColors.lines}`,
					borderBottom: `2px solid ${cadccColors.lines}`,
					boxShadow: hardShadow,
					fontFamily: '"Nunito", sans-serif',
					fontWeight: 600,
					color: "#040115",
					"&.MuiAlert-standardInfo": {
						backgroundColor: `color-mix(in srgb, ${cadccColors.blue} 15%, transparent)`,
						borderLeftColor: cadccColors.blue,
						"& .MuiAlert-icon": { color: cadccColors.blue },
					},
					"&.MuiAlert-standardSuccess": {
						backgroundColor: `color-mix(in srgb, ${cadccColors.green} 15%, transparent)`,
						borderLeftColor: cadccColors.green,
						"& .MuiAlert-icon": { color: cadccColors.green },
					},
					"&.MuiAlert-standardWarning": {
						backgroundColor: `color-mix(in srgb, ${cadccColors.yellow} 30%, transparent)`,
						borderLeftColor: cadccColors.yellow,
						"& .MuiAlert-icon": { color: cadccColors.violet },
					},
					"&.MuiAlert-standardError": {
						backgroundColor: `color-mix(in srgb, ${cadccColors.pink} 15%, transparent)`,
						borderLeftColor: cadccColors.pink,
						"& .MuiAlert-icon": { color: cadccColors.pink },
					},
				},
			},
		},
		MuiTable: {
			styleOverrides: {
				root: {
					borderCollapse: "collapse",
					border: `2px solid ${cadccColors.lines}`,
					boxShadow: hardShadow,
					backgroundColor: "#ffffff",
					borderRadius: 8,
					overflow: "hidden",
				},
			},
		},
		MuiTableCell: {
			styleOverrides: {
				root: {
					borderBottom: `1px solid ${cadccColors.gray}`,
					borderRight: `1px solid ${cadccColors.gray}`,
					textAlign: "center",
					fontFamily: '"Nunito", sans-serif',
					fontSize: "1rem",
				},
				head: {
					backgroundColor: cadccColors.blue,
					color: "#ffffff",
					fontFamily: TOKEN_COMFORTAA,
					fontWeight: 700,
					borderBottom: `2px solid ${cadccColors.lines}`,
				},
			},
		},
		MuiTableRow: {
			styleOverrides: {
				root: {
					"&:nth-of-type(odd)": {
						backgroundColor: "rgba(1, 1, 1, 0.05)",
					},
				},
			},
		},
		MuiChip: {
			styleOverrides: {
				root: {
					borderRadius: 8,
					fontFamily: TOKEN_COMFORTAA,
					fontWeight: 700,
					border: `2px solid ${cadccColors.lines}`,
					boxShadow: `2px 2px 0px ${cadccColors.lines}`,
					"&.MuiChip-colorPrimary": {
						backgroundColor: cadccColors.yellow,
						color: cadccColors.violet,
					},
				},
			},
		},
	},
});

export const cadccTheme: ThemeConfig = {
	id: "cadcc",
	name: "cadcc",
	theme: theme,
	icon: {
		type: "image",
		url: "/cadcc-logo.png", // TODO: handle this with vite
	},
	label: {
		fontFamily: TOKEN_COMFORTAA,
		background: cadccColors.background,
		color: cadccColors.black,
	},
};
