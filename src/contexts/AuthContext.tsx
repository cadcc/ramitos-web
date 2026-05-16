import {
	createContext,
	useContext,
	useState,
	useCallback,
	useMemo,
	useEffect,
	type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Alert, Snackbar } from "@mui/material";
import type { User, AccountRole } from "../api/types";
import { mockUsers } from "../api/mockData";
import {
	clearSession,
	fetchCurrentUser,
	getStoredToken,
	getTokenExpirationTime,
	loadStoredUser,
	loginWithPassword,
	notifySessionExpired,
	onSessionExpired,
	storeDevSession,
	type LoginCredentials,
} from "../api/auth";

interface AuthState {
	user: User | null;
	isAuthenticated: boolean;
	isAdmin: boolean;
	isStudent: boolean;
}

interface AuthContextValue extends AuthState {
	login: (credentials: LoginCredentials) => Promise<void>;
	loginDev: (role: AccountRole) => void;
	logout: () => void;
	loginError: string | null;
	loginPending: boolean;
	loginDialogOpen: boolean;
	openLoginDialog: () => void;
	closeLoginDialog: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const queryClient = useQueryClient();
	const [user, setUser] = useState<User | null>(loadStoredUser);
	const [loginDialogOpen, setLoginDialogOpen] = useState(false);
	const [loginPending, setLoginPending] = useState(false);
	const [loginError, setLoginError] = useState<string | null>(null);
	const [sessionExpiredOpen, setSessionExpiredOpen] = useState(false);

	const expireSession = useCallback(() => {
		clearSession();
		setUser(null);
		setLoginDialogOpen(false);
		setLoginError(null);
		setSessionExpiredOpen(true);
		queryClient.removeQueries({ queryKey: ["ownReview"] });
	}, [queryClient]);

	useEffect(() => onSessionExpired(expireSession), [expireSession]);

	useEffect(() => {
		if (!user) return undefined;
		const expiresAt = getTokenExpirationTime(getStoredToken());
		if (expiresAt === null) return undefined;

		const delay = expiresAt - Date.now();
		if (delay <= 0) {
			notifySessionExpired();
			return undefined;
		}

		const timeoutId = window.setTimeout(notifySessionExpired, delay);
		return () => window.clearTimeout(timeoutId);
	}, [user]);

	useEffect(() => {
		let active = true;
		fetchCurrentUser()
			.then((loadedUser) => {
				if (active && loadedUser) setUser(loadedUser);
			})
			.catch(() => {
				/* keep any stored user as a temporary offline/dev fallback */
			});
		return () => {
			active = false;
		};
	}, []);

	const login = useCallback(async (credentials: LoginCredentials) => {
		setLoginPending(true);
		setLoginError(null);
		try {
			const loggedUser = await loginWithPassword(credentials);
			setUser(loggedUser);
			setLoginDialogOpen(false);
		} catch {
			setLoginError("No pudimos iniciar sesion con esas credenciales.");
		} finally {
			setLoginPending(false);
		}
	}, []);

	const loginDev = useCallback((role: AccountRole) => {
		const mockUser =
			role === "admin"
				? mockUsers.find((u) => u.role === "admin")!
				: mockUsers.find((u) => u.role !== "admin")!;

		storeDevSession(role, mockUser);
		setUser(mockUser);
		setLoginDialogOpen(false);
	}, []);

	const logout = useCallback(() => {
		clearSession();
		setUser(null);
	}, []);

	const closeSessionExpiredSnackbar = useCallback(() => {
		setSessionExpiredOpen(false);
	}, []);

	const openLoginDialog = useCallback(() => {
		setLoginError(null);
		setLoginDialogOpen(true);
	}, []);
	const closeLoginDialog = useCallback(() => {
		setLoginError(null);
		setLoginDialogOpen(false);
	}, []);

	const value = useMemo<AuthContextValue>(() => {
		return {
			user,
			isAuthenticated: user !== null,
			isAdmin: user?.role === "admin" || user?.role === "mod",
			isStudent: user !== null && user.role !== "admin",
			login,
			loginDev,
			logout,
			loginError,
			loginPending,
			loginDialogOpen,
			openLoginDialog,
			closeLoginDialog,
		};
	}, [
		user,
		login,
		loginDev,
		logout,
		loginError,
		loginPending,
		loginDialogOpen,
		openLoginDialog,
		closeLoginDialog,
	]);

	return (
		<AuthContext.Provider value={value}>
			{children}
			<Snackbar
				open={sessionExpiredOpen}
				autoHideDuration={6000}
				onClose={closeSessionExpiredSnackbar}
				anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
			>
				<Alert
					severity="warning"
					variant="filled"
					onClose={closeSessionExpiredSnackbar}
					sx={{ width: "100%" }}
				>
					Tu sesion expiro. Vuelve a iniciar sesion para continuar.
				</Alert>
			</Snackbar>
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error("useAuth must be used within AuthProvider");
	return ctx;
}
