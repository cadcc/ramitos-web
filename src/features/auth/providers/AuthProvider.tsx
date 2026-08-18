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
import type { User } from "../../../shared/types/domain";
import {
	clearSession,
	fetchCurrentUser,
	getStoredToken,
	getTokenExpirationTime,
	getSessionExpiryTimerDelay,
	loginWithDccSecret,
	loginWithPassword,
	notifySessionExpired,
	onSessionExpired,
	startDccLogin,
	type LoginCredentials,
} from "../api/auth.api";

interface AuthState {
	user: User | null;
	isAuthenticated: boolean;
	isAdmin: boolean;
	isStudent: boolean;
}

interface AuthContextValue extends AuthState {
	login: (credentials: LoginCredentials) => Promise<void>;
	startDccLogin: (returnPath?: string) => void;
	completeDccLogin: (secret: string) => Promise<void>;
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
	const [user, setUser] = useState<User | null>(null);
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

		let timeoutId: number | undefined;
		const scheduleExpiryCheck = () => {
			const delay = getSessionExpiryTimerDelay(expiresAt);
			if (delay <= 0) {
				notifySessionExpired();
				return;
			}
			timeoutId = window.setTimeout(scheduleExpiryCheck, delay);
		};

		scheduleExpiryCheck();
		return () => {
			if (timeoutId !== undefined) window.clearTimeout(timeoutId);
		};
	}, [user]);

	useEffect(() => {
		// A stale session check must not race the one-time DCC callback exchange.
		if (window.location.pathname === "/auth/dcc/callback") return;

		let active = true;
		fetchCurrentUser()
			.then((loadedUser) => {
				if (active && loadedUser) setUser(loadedUser);
			})
			.catch(() => {
				clearSession();
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

	const completeDccLogin = useCallback(async (secret: string) => {
		setLoginPending(true);
		setLoginError(null);
		try {
			const loggedUser = await loginWithDccSecret(secret);
			setUser(loggedUser);
			setLoginDialogOpen(false);
		} finally {
			setLoginPending(false);
		}
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
			startDccLogin,
			completeDccLogin,
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
		completeDccLogin,
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
