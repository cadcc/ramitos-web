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
import { lightTheme, darkTheme } from "../theme/theme";

type ThemeMode = "light" | "dark";

interface ThemeContextValue {
	mode: ThemeMode;
	toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getInitialMode(): ThemeMode {
	const stored = localStorage.getItem("ramitos-theme");
	if (stored === "light" || stored === "dark") return stored;
	return window.matchMedia("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
	const [mode, setMode] = useState<ThemeMode>(getInitialMode);

	useEffect(() => {
		localStorage.setItem("ramitos-theme", mode);
	}, [mode]);

	const toggleTheme = () => setMode((m) => (m === "light" ? "dark" : "light"));

	const theme = useMemo(
		() => (mode === "light" ? lightTheme : darkTheme),
		[mode],
	);

	const value = useMemo(() => ({ mode, toggleTheme }), [mode]);

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
