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
