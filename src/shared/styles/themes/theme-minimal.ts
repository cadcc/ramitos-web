/**
 * ==========================================
 * THEME: Minimal Atmospheric (Light & Dark)
 * ==========================================
 * VISION:
 * Calm, premium, and sophisticated. Inspired by high-end developer tools.
 * It uses layered slates (dark) or soft zincs (light) with a singular
 * warm amber accent that acts like a glowing ember/sunbeam.
 * * RULES:
 * - Depth: Glassmorphism (translucency + blur) over harsh shadows.
 * - Borders: Extremely subtle (8% opacity).
 * - Typography: Space Grotesk (Display) + Inter (Body).
 * - Motion: Smooth, subtle scales (1.02 on hover, 0.98 on press).
 * - Vibe: Late-night coding (Dark) / Clean morning desk (Light).
 */

import { createTheme, type ThemeOptions } from "@mui/material/styles";
import type { ThemeConfig } from "..";
import { Contrast, LightMode } from "@mui/icons-material";

// 1. Define the unified token interface
interface MinimalTokens {
	bgBase: string;
	bgElevated: string;
	bgCard: string;
	bgCardHover: string;
	bgAppBar: string;
	menuBg: string;
	textMain: string;
	textMuted: string;
	accent: string;
	accentGlow: string;
	accentMuted: string;
	borderSubtle: string;
	borderHover: string;
	hoverBg: string; // Subtle hover for text/icon buttons
	shadowSm: string;
	shadowMd: string;
	buttonText: string;
}

// 2. Dark Mode Tokens
const darkTokens: MinimalTokens = {
	bgBase: "#0A0A0F",
	bgElevated: "#12121A",
	bgCard: "rgba(26, 26, 36, 0.6)",
	bgCardHover: "rgba(26, 26, 36, 0.8)",
	bgAppBar: "rgba(10, 10, 15, 0.8)",
	menuBg: "#1A1A24",
	textMain: "#FAFAFA",
	textMuted: "#71717A",
	accent: "#F59E0B",
	accentGlow: "rgba(245, 158, 11, 0.4)",
	accentMuted: "rgba(245, 158, 11, 0.15)",
	borderSubtle: "rgba(255, 255, 255, 0.08)",
	borderHover: "rgba(255, 255, 255, 0.15)",
	hoverBg: "rgba(255, 255, 255, 0.05)",
	shadowSm: "0 4px 6px rgba(0, 0, 0, 0.2)",
	shadowMd: "0 10px 20px rgba(0, 0, 0, 0.4)",
	buttonText: "#0A0A0F",
};

// 3. Light Mode Tokens
const lightTokens: MinimalTokens = {
	bgBase: "#F4F4F5", // Soft Zinc 100
	bgElevated: "#FFFFFF",
	bgCard: "rgba(255, 255, 255, 0.6)",
	bgCardHover: "rgba(255, 255, 255, 0.9)",
	bgAppBar: "rgba(244, 244, 245, 0.8)",
	menuBg: "#FFFFFF",
	textMain: "#09090B", // Zinc 950
	textMuted: "#52525B", // Zinc 600
	accent: "#F59E0B", // Keep the warm amber!
	accentGlow: "rgba(245, 158, 11, 0.3)",
	accentMuted: "rgba(245, 158, 11, 0.15)",
	borderSubtle: "rgba(0, 0, 0, 0.08)",
	borderHover: "rgba(0, 0, 0, 0.15)",
	hoverBg: "rgba(0, 0, 0, 0.04)",
	shadowSm: "0 4px 6px rgba(0, 0, 0, 0.05)", // Softer shadows for light mode
	shadowMd: "0 10px 20px rgba(0, 0, 0, 0.1)",
	buttonText: "#0A0A0F",
};

const TOKEN_TITLE_FONT_FAMILY = '"Space Grotesk", sans-serif';

const sharedTypography = {
	fontFamily: '"Inter", sans-serif',
	h1: {
		fontFamily: TOKEN_TITLE_FONT_FAMILY,
		fontWeight: 700,
		letterSpacing: "-0.025em",
	},
	h2: {
		fontFamily: TOKEN_TITLE_FONT_FAMILY,
		fontWeight: 700,
		letterSpacing: "-0.025em",
	},
	h3: {
		fontFamily: TOKEN_TITLE_FONT_FAMILY,
		fontWeight: 600,
		letterSpacing: "-0.025em",
	},
	h4: {
		fontFamily: TOKEN_TITLE_FONT_FAMILY,
		fontWeight: 600,
		letterSpacing: "-0.025em",
	},
	h5: { fontFamily: TOKEN_TITLE_FONT_FAMILY, fontWeight: 600 },
	h6: { fontFamily: TOKEN_TITLE_FONT_FAMILY, fontWeight: 600 },
	subtitle1: { letterSpacing: "0.01em" },
	button: {
		fontFamily: '"Inter", sans-serif',
		fontWeight: 500,
		textTransform: "none",
		letterSpacing: "0.01em",
	},
	body1: { lineHeight: 1.6 },
	body2: { lineHeight: 1.6 },
	overline: {
		fontFamily: '"JetBrains Mono", monospace',
		letterSpacing: "0.05em",
	},
};

// 4. The Theme Factory
function buildMinimalTheme(tokens: MinimalTokens, mode: "light" | "dark") {
	return createTheme({
		palette: {
			mode,
			primary: { main: tokens.accent, contrastText: tokens.buttonText },
			secondary: { main: tokens.bgElevated, contrastText: tokens.textMain },
			background: { default: tokens.bgBase, paper: tokens.bgElevated },
			text: { primary: tokens.textMain, secondary: tokens.textMuted },
			divider: tokens.borderSubtle,
		},
		typography: {
			...sharedTypography,
			// Map text colors explicitly onto the shared typography
			h1: { ...sharedTypography.h1, color: tokens.textMain },
			h2: { ...sharedTypography.h2, color: tokens.textMain },
			h3: { ...sharedTypography.h3, color: tokens.textMain },
			h4: { ...sharedTypography.h4, color: tokens.textMain },
			h5: { ...sharedTypography.h5, color: tokens.textMain },
			h6: { ...sharedTypography.h6, color: tokens.textMain },
			subtitle1: { ...sharedTypography.subtitle1, color: tokens.textMuted },
			body1: { ...sharedTypography.body1, color: tokens.textMain },
			body2: { ...sharedTypography.body2, color: tokens.textMuted },
			overline: { ...sharedTypography.overline, color: tokens.textMuted },
		},
		shape: { borderRadius: 8 },
		components: {
			MuiCssBaseline: {
				styleOverrides: `
                    body {
                        background-color: ${tokens.bgBase};
                        color: ${tokens.textMain};
                        /* Ambient background glow orb */
                        background-image: radial-gradient(circle at 50% 0%, rgba(245, 158, 11, 0.04) 0%, transparent 50%);
                        background-attachment: fixed;
                    }
                    
                    /* Global Focus Rings - Amber Glow */
                    *:focus-visible {
                        outline: none !important;
                        box-shadow: 0 0 0 2px ${tokens.bgBase}, 0 0 0 4px ${tokens.accent} !important;
                    }

                    ::selection {
                        background-color: ${tokens.accentMuted};
                        color: ${tokens.textMain};
                    }
                `,
			},
			MuiButton: {
				defaultProps: { disableElevation: true },
				styleOverrides: {
					root: {
						borderRadius: 8,
						padding: "8px 24px",
						transition: "all 0.2s ease-out",
						"&:active": {
							transform: "scale(0.98)", // Gentle physical press
						},
						"&.MuiButton-containedPrimary": {
							backgroundColor: tokens.accent,
							color: tokens.buttonText,
							"&:hover": {
								backgroundColor: "#FBBF24", // amber-400
								boxShadow: `0 0 20px ${tokens.accentGlow}`,
							},
						},
						"&.MuiButton-outlined": {
							borderColor: tokens.borderSubtle,
							color: tokens.textMain,
							"&:hover": {
								backgroundColor: tokens.hoverBg,
								borderColor: tokens.borderHover,
							},
						},
						"&.MuiButton-text": {
							color: tokens.textMuted,
							"&:hover": {
								color: tokens.textMain,
								backgroundColor: tokens.hoverBg,
							},
						},
					},
				},
			},
			MuiCard: {
				styleOverrides: {
					root: {
						borderRadius: 12,
						backgroundColor: tokens.bgCard,
						backdropFilter: "blur(8px)",
						border: `1px solid ${tokens.borderSubtle}`,
						backgroundImage: "none",
						boxShadow: tokens.shadowSm,
						transition: "all 0.3s ease-out",
						"&:hover": {
							transform: "scale(1.02)",
							borderColor: tokens.borderHover,
							backgroundColor: tokens.bgCardHover,
							boxShadow: tokens.shadowMd,
						},
					},
				},
			},
			MuiPaper: {
				styleOverrides: {
					root: {
						borderRadius: 12,
						backgroundColor: tokens.bgCard,
						backdropFilter: "blur(8px)",
						border: `1px solid ${tokens.borderSubtle}`,
						backgroundImage: "none",
						boxShadow: "none",
					},
				},
			},
			MuiAppBar: {
				styleOverrides: {
					root: {
						backgroundColor: tokens.bgAppBar,
						backdropFilter: "blur(12px)",
						borderBottom: `1px solid ${tokens.borderSubtle}`,
						borderTop: "none",
						borderLeft: "none",
						borderRight: "none",
						borderRadius: 0,
						boxShadow: "none",
					},
				},
			},
			MuiOutlinedInput: {
				styleOverrides: {
					root: {
						borderRadius: 8,
						backgroundColor: tokens.bgCard,
						backdropFilter: "blur(8px)",
						transition: "all 0.2s ease-out",
						"& .MuiOutlinedInput-notchedOutline": {
							borderColor: tokens.borderSubtle,
						},
						"&:hover .MuiOutlinedInput-notchedOutline": {
							borderColor: tokens.borderHover,
						},
						"&.Mui-focused": {
							boxShadow: `0 0 20px rgba(245, 158, 11, 0.1)`,
						},
						"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
							borderColor: "rgba(245, 158, 11, 0.5)",
							borderWidth: 1,
						},
					},
				},
			},
			MuiInputLabel: {
				styleOverrides: {
					root: {
						color: tokens.textMuted,
						"&.Mui-focused": { color: tokens.accent },
					},
				},
			},
			MuiMenu: {
				styleOverrides: {
					paper: {
						backgroundColor: tokens.menuBg,
						border: `1px solid ${tokens.borderHover}`,
						boxShadow: tokens.shadowMd,
					},
				},
			},
			MuiChip: {
				styleOverrides: {
					root: {
						backgroundColor: tokens.bgElevated,
						border: `1px solid ${tokens.borderSubtle}`,
						color: tokens.textMuted,
						"&:hover": {
							backgroundColor: tokens.hoverBg,
							color: tokens.textMain,
						},
					},
					colorPrimary: {
						backgroundColor: tokens.accentMuted,
						borderColor: "rgba(245, 158, 11, 0.3)",
						color: tokens.accent,
						"&:hover": {
							backgroundColor: "rgba(245, 158, 11, 0.25)",
						},
					},
				},
			},
		},
	});
}

export const minimalDarkTheme: ThemeConfig = {
	id: "minimalDark",
	name: "lorenzo",
	theme: buildMinimalTheme(darkTokens, "dark"),
	icon: {
		type: "mui",
		component: Contrast,
		color: darkTokens.accent,
	},
	label: {
		fontFamily: TOKEN_TITLE_FONT_FAMILY,
		background: darkTokens.bgElevated,
		color: darkTokens.textMain,
	},
};

export const minimalLightTheme: ThemeConfig = {
	id: "minimalLight",
	name: "eniac",
	theme: buildMinimalTheme(lightTokens, "light"),
	icon: {
		type: "mui",
		component: LightMode,
		color: lightTokens.accent,
	},
	label: {
		fontFamily: TOKEN_TITLE_FONT_FAMILY,
		background: lightTokens.bgElevated,
		color: lightTokens.textMain,
	},
};
