import { createTheme, type ThemeOptions } from "@mui/material/styles";

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

export const appThemes = {
	light: lightTheme,
	dark: darkTheme,
	terminal: terminalTheme,
};

export type ThemeName = keyof typeof appThemes;
