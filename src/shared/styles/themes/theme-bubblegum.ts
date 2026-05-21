/**
 * ==========================================
 * THEME: Bubblegum Neumorphism
 * ==========================================
 * VISION:
 * Soft, tactile, and unapologetically pink. This theme uses Neumorphism
 * (Soft UI) physics to make elements look like they are molded from matte
 * bubblegum. No borders are allowed—only dual opposing shadows (light
 * and dark pink) create the illusion of extrusion and inset depth.
 * * RULES:
 * - Colors: Monochromatic light pink base (#ffcae5) with Mint Green contrast.
 * - Shapes: Hyper-rounded (32px for cards, 16px for inputs/buttons).
 * - Depth: Convex (extruded) for resting, Concave (inset) for active/wells.
 * - Borders: NONE. Shadows do all the visual work.
 * - Vibe: Y2K pop, tactile, soft, and bouncy.
 */

import { createTheme, type ThemeOptions } from "@mui/material/styles";
import type { ThemeConfig } from "..";
import { BubbleChartTwoTone } from "@mui/icons-material";

const bubbleTokens = {
	bg: "hsl(329, 80%, 90%)", // Light Bubblegum Base
	textMain: "#7A003C", // Deep Magenta (High contrast for accessibility)
	textMuted: "#B8005A", // Mid Magenta
	primary: "#ff0081", // Hot Pink
	secondary: "#00E6A7", // Mint Green (Contrast)
	lightShadow: "rgba(255, 255, 255, 0.5)",
	darkShadow: "rgba(255, 119, 188, 0.5)", // #ff77bc with opacity
	darkShadowHover: "rgba(255, 119, 188, 0.65)",
};

const shadows = {
	extruded: `9px 9px 16px ${bubbleTokens.darkShadow}, -9px -9px 16px ${bubbleTokens.lightShadow}`,
	extrudedHover: `12px 12px 20px ${bubbleTokens.darkShadowHover}, -12px -12px 20px rgba(255, 255, 255, 0.9)`,
	extrudedSmall: `5px 5px 10px ${bubbleTokens.darkShadow}, -5px -5px 10px ${bubbleTokens.lightShadow}`,
	inset: `inset 6px 6px 10px ${bubbleTokens.darkShadow}, inset -6px -6px 10px ${bubbleTokens.lightShadow}`,
	insetDeep: `inset 10px 10px 20px ${bubbleTokens.darkShadowHover}, inset -10px -10px 20px rgba(255, 255, 255, 0.9)`,
};

const TOKEN_TITLE_FONT_FAMILY = '"Fredoka", sans-serif';

const bubbleTypography: ThemeOptions["typography"] = {
	fontFamily: '"DM Sans", sans-serif',
	h1: {
		fontFamily: TOKEN_TITLE_FONT_FAMILY,
		fontWeight: 600,
		color: bubbleTokens.textMain,
		letterSpacing: "-0.03em",
	},
	h2: {
		fontFamily: TOKEN_TITLE_FONT_FAMILY,
		fontWeight: 600,
		color: bubbleTokens.textMain,
		letterSpacing: "-0.02em",
	},
	h3: {
		fontFamily: TOKEN_TITLE_FONT_FAMILY,
		fontWeight: 600,
		color: bubbleTokens.textMain,
	},
	h4: {
		fontFamily: TOKEN_TITLE_FONT_FAMILY,
		fontWeight: 500,
		color: bubbleTokens.textMain,
	},
	h5: {
		fontFamily: TOKEN_TITLE_FONT_FAMILY,
		fontWeight: 500,
		color: bubbleTokens.textMain,
	},
	h6: {
		fontFamily: TOKEN_TITLE_FONT_FAMILY,
		fontWeight: 500,
		color: bubbleTokens.textMain,
	},
	subtitle1: { fontWeight: 500, color: bubbleTokens.textMuted },
	button: {
		fontFamily: TOKEN_TITLE_FONT_FAMILY,
		fontWeight: 700,
		textTransform: "none",
		fontSize: "1rem",
	},
	body1: { color: bubbleTokens.textMain, fontWeight: 500 },
	body2: { color: bubbleTokens.textMuted, fontWeight: 500 },
};

export const theme = createTheme({
	palette: {
		mode: "light",
		primary: { main: bubbleTokens.primary, contrastText: "#ffffff" },
		secondary: {
			main: bubbleTokens.secondary,
			contrastText: bubbleTokens.textMain,
		},
		background: { default: bubbleTokens.bg, paper: bubbleTokens.bg }, // Paper MUST match bg for Neumorphism
		text: { primary: bubbleTokens.textMain, secondary: bubbleTokens.textMuted },
		divider: "rgba(255, 119, 188, 0.2)",
		error: { main: "#FF3B30" },
		warning: { main: "#FF9F0A" },
		success: { main: bubbleTokens.secondary },
		info: { main: "#0A84FF" },
	},
	typography: bubbleTypography,
	shape: { borderRadius: 32 }, // Max roundness for the soft aesthetic
	components: {
		MuiCssBaseline: {
			styleOverrides: `
                body {
                    background-color: ${bubbleTokens.bg};
                    color: ${bubbleTokens.textMain};
                    /* Smooth scrolling and floating animations */
                    scroll-behavior: smooth;
                }
                
                /* Neumorphic Focus Ring */
                *:focus-visible {
                    outline: none !important;
                    box-shadow: 0 0 0 3px ${bubbleTokens.bg}, 0 0 0 5px ${bubbleTokens.secondary} !important;
                    border-radius: inherit;
                }
            `,
		},
		MuiButton: {
			defaultProps: {
				disableElevation: true,
				disableRipple: true, // Ripples break the physical illusion of molded plastic
			},
			styleOverrides: {
				root: {
					borderRadius: 16,
					border: "none",
					padding: "10px 24px",
					backgroundColor: bubbleTokens.bg,
					color: bubbleTokens.textMain,
					boxShadow: shadows.extruded,
					transition: "all 0.3s ease-out",
					"&:hover": {
						backgroundColor: bubbleTokens.bg,
						transform: "translateY(-1px)",
						boxShadow: shadows.extrudedHover,
					},
					"&:active": {
						transform: "translateY(1px)",
						boxShadow: shadows.inset,
					},
					// Colored variants need specific shadow handling to maintain the illusion
					"&.MuiButton-containedPrimary": {
						backgroundColor: bubbleTokens.primary,
						color: "#ffffff",
						boxShadow: `6px 6px 12px rgba(255, 0, 129, 0.4), -6px -6px 12px rgba(255, 202, 229, 0.8)`,
						"&:hover": { backgroundColor: "#e60074" },
						"&:active": {
							boxShadow: `inset 4px 4px 8px rgba(153, 0, 77, 0.5), inset -4px -4px 8px rgba(255, 72, 165, 0.5)`,
						},
					},
					"&.MuiButton-containedSecondary": {
						backgroundColor: bubbleTokens.secondary,
						color: bubbleTokens.textMain,
						boxShadow: `6px 6px 12px rgba(0, 184, 132, 0.4), -6px -6px 12px rgba(255, 255, 255, 0.6)`,
						"&:hover": { backgroundColor: "#00cc94" },
						"&:active": {
							boxShadow: `inset 4px 4px 8px rgba(0, 138, 100, 0.4), inset -4px -4px 8px rgba(52, 255, 199, 0.5)`,
						},
					},
				},
			},
		},
		MuiCard: {
			styleOverrides: {
				root: {
					borderRadius: 32,
					backgroundColor: bubbleTokens.bg,
					border: "none",
					boxShadow: shadows.extruded,
					transition: "transform 0.3s ease-out, box-shadow 0.3s ease-out",
					"&:hover": {
						transform: "translateY(-2px)",
						boxShadow: shadows.extrudedHover,
					},
				},
			},
		},
		MuiPaper: {
			styleOverrides: {
				root: {
					borderRadius: 32,
					backgroundColor: bubbleTokens.bg,
					border: "none",
					boxShadow: shadows.extruded,
					backgroundImage: "none",
				},
			},
		},
		MuiAppBar: {
			styleOverrides: {
				root: {
					backgroundColor: bubbleTokens.bg,
					color: bubbleTokens.textMain,
					borderRadius: 0,
					boxShadow: `0px 10px 20px ${bubbleTokens.darkShadow}`, // Extrudes out over the page
				},
			},
		},
		MuiOutlinedInput: {
			styleOverrides: {
				root: {
					borderRadius: 16,
					backgroundColor: bubbleTokens.bg,
					boxShadow: shadows.inset,
					transition: "all 0.3s ease-out",
					// Neumorphism has no borders
					"& .MuiOutlinedInput-notchedOutline": { border: "none" },
					"&:hover": {
						boxShadow: shadows.insetDeep,
					},
					"&.Mui-focused": {
						boxShadow: shadows.insetDeep,
					},
					// We use an inner mint ring instead of an outline for focus
					"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
						border: `2px solid ${bubbleTokens.secondary}`,
						opacity: 0.5,
					},
				},
			},
		},
		MuiAlert: {
			styleOverrides: {
				root: {
					borderRadius: 24,
					backgroundColor: bubbleTokens.bg,
					boxShadow: shadows.insetDeep, // Alerts feel carved into the page
					border: "none",
					color: bubbleTokens.textMain,
					"& .MuiAlert-icon": {
						filter: `drop-shadow(2px 2px 4px ${bubbleTokens.darkShadow})`,
					},

					"&.MuiAlert-standardInfo": {
						"& .MuiAlert-icon": { color: "#0A84FF" },
					},
					"&.MuiAlertstandardSuccess": {
						"& .MuiAlert-icon": { color: bubbleTokens.secondary },
					},
					"&.MuiAlertstandardWarning": {
						"& .MuiAlert-icon": { color: "#FF9F0A" },
					},
					"&.MuiAlertstandardError": {
						"& .MuiAlert-icon": { color: "#FF3B30" },
					},
				},
			},
		},
		MuiTable: {
			styleOverrides: {
				root: {
					backgroundColor: bubbleTokens.bg,
					borderRadius: 24,
					boxShadow: shadows.inset, // The whole table is a shallow well
					borderCollapse: "separate",
					borderSpacing: "0",
					overflow: "hidden",
				},
			},
		},
		MuiTableCell: {
			styleOverrides: {
				root: {
					borderBottom: `1px solid rgba(255, 119, 188, 0.15)`,
					color: bubbleTokens.textMain,
				},
				head: {
					fontFamily: '"Plus Jakarta Sans", sans-serif',
					fontWeight: 800,
					color: bubbleTokens.textMuted,
					textTransform: "uppercase",
					letterSpacing: "0.05em",
					borderBottom: `2px solid rgba(255, 119, 188, 0.25)`,
				},
			},
		},
		MuiChip: {
			styleOverrides: {
				root: {
					borderRadius: 9999,
					backgroundColor: bubbleTokens.bg,
					boxShadow: shadows.extrudedSmall,
					border: "none",
					fontWeight: 700,
					color: bubbleTokens.textMain,
				},
			},
		},
	},
});

export const bubblegumTheme: ThemeConfig = {
	id: "bubblegum",
	name: "kioskito",
	theme: theme,
	icon: {
		type: "mui",
		component: BubbleChartTwoTone,
		color: bubbleTokens.primary,
	},
	label: {
		fontFamily: TOKEN_TITLE_FONT_FAMILY,
		background: bubbleTokens.bg,
		color: bubbleTokens.textMain,
	},
};
