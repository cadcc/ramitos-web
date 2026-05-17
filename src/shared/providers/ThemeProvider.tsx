import {
	createContext,
	useContext,
	useState,
	useMemo,
	useEffect,
	type ReactNode,
} from "react";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { appThemes, type ThemeName } from "../../theme/theme";

interface ThemeContextValue {
	currentTheme: ThemeName;
	setTheme: (name: ThemeName) => void;
	availableThemes: ThemeName[];
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getInitialTheme(): ThemeName {
	const stored = localStorage.getItem("ramitos-theme");
	// Check if the stored theme actually exists in our appThemes object
	if (stored && stored in appThemes) {
		return stored as ThemeName;
	}
	return window.matchMedia("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
	const [currentTheme, setCurrentTheme] = useState<ThemeName>(getInitialTheme);

	useEffect(() => {
		localStorage.setItem("ramitos-theme", currentTheme);
	}, [currentTheme]);

	// Retrieve the actual MUI theme object based on the current selection
	const theme = useMemo(
		() => appThemes[currentTheme] || appThemes.light,
		[currentTheme],
	);

	const value = useMemo(
		() => ({
			currentTheme,
			setTheme: setCurrentTheme,
			// Dynamically extract available themes so the UI can build a menu
			availableThemes: Object.keys(appThemes) as ThemeName[],
		}),
		[currentTheme],
	);

	return (
		<ThemeContext.Provider value={value}>
			<MuiThemeProvider theme={theme}>
				<CssBaseline />
				{children}
			</MuiThemeProvider>
		</ThemeContext.Provider>
	);
}

export function useThemeMode() {
	const ctx = useContext(ThemeContext);
	if (!ctx) throw new Error("useThemeMode must be used within ThemeProvider");
	return ctx;
}
