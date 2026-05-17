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
import { appThemes, type ThemeKey, type ThemeConfig } from "../styles";

interface ThemeContextValue {
	currentTheme: ThemeKey;
	setTheme: (name: ThemeKey) => void;
	availableThemes: ThemeConfig[];
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getInitialTheme(): ThemeKey {
	const stored = localStorage.getItem("ramitos-theme");
	if (stored && stored in appThemes) {
		return stored as ThemeKey;
	}
	return window.matchMedia("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
	const [currentTheme, setCurrentTheme] = useState<ThemeKey>(getInitialTheme);

	useEffect(() => {
		localStorage.setItem("ramitos-theme", currentTheme);
	}, [currentTheme]);

	const muiTheme = useMemo(
		() => appThemes[currentTheme]?.theme || appThemes.light.theme,
		[currentTheme],
	);

	const value = useMemo(
		() => ({
			currentTheme,
			setTheme: setCurrentTheme,
			availableThemes: Object.values(appThemes),
		}),
		[currentTheme],
	);

	return (
		<ThemeContext.Provider value={value}>
			<MuiThemeProvider theme={muiTheme}>
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
