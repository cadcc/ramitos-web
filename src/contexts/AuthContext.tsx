import {
	createContext,
	useContext,
	useState,
	useCallback,
	useMemo,
	type ReactNode,
} from "react";
import type { User, AccountRole } from "../api/types";
import { mockUsers } from "../api/mockData";

interface AuthState {
	user: User | null;
	isAuthenticated: boolean;
	isAdmin: boolean;
	isStudent: boolean;
}

interface AuthContextValue extends AuthState {
	login: (role: AccountRole) => void;
	logout: () => void;
	loginDialogOpen: boolean;
	openLoginDialog: () => void;
	closeLoginDialog: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function loadStoredUser(): User | null {
	try {
		const stored = localStorage.getItem("ramitos-user");
		if (stored) return JSON.parse(stored) as User;
	} catch {
		/* ignore */
	}
	return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(loadStoredUser);
	const [loginDialogOpen, setLoginDialogOpen] = useState(false);

	const login = useCallback((role: AccountRole) => {
		const mockUser =
			role === "admin"
				? mockUsers.find((u) => u.role === "admin")!
				: mockUsers.find((u) => u.role !== "admin")!;

		localStorage.setItem("ramitos-token", "mock-jwt-" + mockUser.id);
		localStorage.setItem("ramitos-user", JSON.stringify(mockUser));
		setUser(mockUser);
		setLoginDialogOpen(false);
	}, []);

	const logout = useCallback(() => {
		localStorage.removeItem("ramitos-token");
		localStorage.removeItem("ramitos-user");
		setUser(null);
	}, []);

	const openLoginDialog = useCallback(() => setLoginDialogOpen(true), []);
	const closeLoginDialog = useCallback(() => setLoginDialogOpen(false), []);

	const value = useMemo<AuthContextValue>(() => {
		return {
			user,
			isAuthenticated: user !== null,
			isAdmin: user?.role === "admin" || user?.role === "mod",
			isStudent: user !== null && user.role !== "admin",
			login,
			logout,
			loginDialogOpen,
			openLoginDialog,
			closeLoginDialog,
		};
	}, [user, login, logout, loginDialogOpen, openLoginDialog, closeLoginDialog]);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error("useAuth must be used within AuthProvider");
	return ctx;
}
