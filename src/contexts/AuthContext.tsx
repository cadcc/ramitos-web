import {
	createContext,
	useContext,
	useState,
	useCallback,
	useMemo,
	useEffect,
	type ReactNode,
} from "react";
import type { User, AccountRole } from "../api/types";
import { mockUsers } from "../api/mockData";
import {
	clearSession,
	fetchCurrentUser,
	loadStoredUser,
	loginWithPassword,
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
	const [user, setUser] = useState<User | null>(loadStoredUser);
	const [loginDialogOpen, setLoginDialogOpen] = useState(false);
	const [loginPending, setLoginPending] = useState(false);
	const [loginError, setLoginError] = useState<string | null>(null);

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

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error("useAuth must be used within AuthProvider");
	return ctx;
}
