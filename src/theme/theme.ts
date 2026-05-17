import { createTheme, type ThemeOptions } from "@mui/material/styles";

// TODO: split into one file per theme

const sharedTypography: ThemeOptions["typography"] = {
	fontFamily: '"Figtree", sans-serif',
	h1: {
		fontFamily: '"Space Grotesk", sans-serif',
		fontWeight: 700,
		letterSpacing: "-0.03em",
	},
	h2: {
		fontFamily: '"Space Grotesk", sans-serif',
		fontWeight: 700,
		letterSpacing: "-0.02em",
	},
	h3: {
		fontFamily: '"Space Grotesk", sans-serif',
		fontWeight: 700,
		letterSpacing: "-0.02em",
	},
	h4: {
		fontFamily: '"Space Grotesk", sans-serif',
		fontWeight: 600,
		letterSpacing: "-0.01em",
	},
	h5: {
		fontFamily: '"Space Grotesk", sans-serif',
		fontWeight: 600,
	},
	h6: {
		fontFamily: '"Space Grotesk", sans-serif',
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
		fontFamily: '"Space Grotesk", sans-serif',
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

export const lightTheme = createTheme({
	palette: {
		mode: "light",
		primary: {
			main: "#268BD2",
			light: "#4DA3E0",
			dark: "#1A6BA8",
			contrastText: "#FDF6E3",
		},
		secondary: {
			main: "#D33682",
			light: "#DC5A9A",
			dark: "#A82968",
			contrastText: "#FDF6E3",
		},
		background: {
			default: "#FDF6E3",
			paper: "#FFFCF0",
		},
		text: {
			primary: "#073642",
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
					backgroundColor: "#FDF6E3",
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

export const darkTheme = createTheme({
	palette: {
		mode: "dark",
		primary: {
			main: "#268BD2",
			light: "#4DA3E0",
			dark: "#1A6BA8",
			contrastText: "#FDF6E3",
		},
		secondary: {
			main: "#D33682",
			light: "#DC5A9A",
			dark: "#A82968",
			contrastText: "#002B36",
		},
		background: {
			default: "#002B36",
			paper: "#073642",
		},
		text: {
			primary: "#FDF6E3",
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

export const terminalTheme = createTheme({
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

// CADCC theme
// TODO: fix overlapping text
// TODO: adjust rounding
// TODO: make navbar flush with top of screen

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

// Playful Geometric shadow tokens
const hardShadow = `4px 4px 0px ${cadccColors.lines}`;
const hardShadowHover = `6px 6px 0px ${cadccColors.lines}`;
const hardShadowCard = `8px 8px 0px ${cadccColors.lines}`;

const cadccTypography: ThemeOptions["typography"] = {
    fontFamily: '"Nunito", sans-serif',
    h1: { fontFamily: '"Comfortaa", cursive', fontWeight: 700, color: cadccColors.violet, fontSize: "2rem" },
    h2: { fontFamily: '"Comfortaa", cursive', fontWeight: 700, color: cadccColors.violet, fontSize: "1.5rem" },
    h3: { fontFamily: '"Comfortaa", cursive', fontWeight: 700, color: cadccColors.violet, fontSize: "1.25rem" },
    h4: { fontFamily: '"Comfortaa", cursive', fontWeight: 700, color: cadccColors.violet, fontSize: "1.1rem" },
    h5: { fontFamily: '"Comfortaa", cursive', fontWeight: 700, color: cadccColors.violet },
    h6: { fontFamily: '"Comfortaa", cursive', fontWeight: 700, color: cadccColors.violet },
    subtitle1: { fontWeight: 700, color: cadccColors.gray },
    button: { 
        fontFamily: '"Comfortaa", cursive', 
        fontWeight: 700, 
        textTransform: "none",
        fontSize: "1rem",
    },
    body1: { color: "#040115", fontWeight: 500 },
    body2: { color: "#040115", fontWeight: 500 },
};

export const cadccTheme = createTheme({
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
    shape: { borderRadius: 16 }, // Base radius for cards/inputs
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
                    borderRadius: 9999, // Pill shape
                    border: `2px solid ${cadccColors.lines}`,
                    padding: "8px 24px",
                    transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)", // Bouncy hover
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
                    }
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
                        transform: "rotate(-1deg) scale(1.01)", // Playful wiggle
                    }
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
                    boxShadow: "none",
                }
            }
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    backgroundColor: "#ffffff",
                    border: `2px solid ${cadccColors.gray}`,
                    boxShadow: "none",
                    transition: "all 0.2s ease",
                    "& .MuiOutlinedInput-notchedOutline": {
                        border: "none",
                    },
                    "&:hover": {
                        borderColor: cadccColors.blue,
                    },
                    "&.Mui-focused": {
                        borderColor: cadccColors.blue,
                        boxShadow: `4px 4px 0px ${cadccColors.blue}`,
                        transform: "translate(-2px, -2px)",
                    },
                },
            },
        },
        // Mapping your Admonition CSS to MUI Alerts
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
                        "& .MuiAlert-icon": { color: cadccColors.blue }
                    },
                    "&.MuiAlert-standardSuccess": {
                        backgroundColor: `color-mix(in srgb, ${cadccColors.green} 15%, transparent)`,
                        borderLeftColor: cadccColors.green,
                        "& .MuiAlert-icon": { color: cadccColors.green }
                    },
                    "&.MuiAlert-standardWarning": {
                        backgroundColor: `color-mix(in srgb, ${cadccColors.yellow} 30%, transparent)`,
                        borderLeftColor: cadccColors.yellow,
                        "& .MuiAlert-icon": { color: cadccColors.violet } // Yellow icon is hard to read, use violet
                    },
                    "&.MuiAlert-standardError": {
                        backgroundColor: `color-mix(in srgb, ${cadccColors.pink} 15%, transparent)`,
                        borderLeftColor: cadccColors.pink,
                        "& .MuiAlert-icon": { color: cadccColors.pink }
                    }
                }
            }
        },
        // Mapping your Table CSS to MUI Tables
        MuiTable: {
            styleOverrides: {
                root: {
                    borderCollapse: "collapse",
                    border: `2px solid ${cadccColors.lines}`,
                    boxShadow: hardShadow,
                    backgroundColor: "#ffffff",
                    borderRadius: 8,
                    overflow: "hidden", // Keeps rounded corners on the table wrapper
                }
            }
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
                    fontFamily: '"Comfortaa", cursive',
                    fontWeight: 700,
                    borderBottom: `2px solid ${cadccColors.lines}`,
                }
            }
        },
        MuiTableRow: {
            styleOverrides: {
                root: {
                    "&:nth-of-type(odd)": {
                        backgroundColor: "rgba(1, 1, 1, 0.05)",
                    }
                }
            }
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    fontFamily: '"Comfortaa", cursive',
                    fontWeight: 700,
                    border: `2px solid ${cadccColors.lines}`,
                    boxShadow: `2px 2px 0px ${cadccColors.lines}`,
                    "&.MuiChip-colorPrimary": {
                        backgroundColor: cadccColors.yellow,
                        color: cadccColors.violet,
                    }
                }
            }
        },
    },
});

export const appThemes = {
	light: lightTheme,
	dark: darkTheme,
	terminal: terminalTheme,
	retro: retroTheme,
	cadcc: cadccTheme,
};

export type ThemeName = keyof typeof appThemes;
