import {
	createContext,
	useContext,
	useState,
	useCallback,
	useMemo,
	useEffect,
	useSyncExternalStore,
	Fragment,
	type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Alert, Button } from "@mui/material";
import type { LoginCredentials } from "../api/auth.api";
import {
	session,
	type Session,
	type SessionSnapshot,
	type LoginOutcome,
} from "../model/session";

interface AuthContextValue {
	user: SessionSnapshot["user"];
	status: SessionSnapshot["status"];
	issue: SessionSnapshot["issue"];
	isAuthenticated: boolean;
	isAdmin: boolean;
	isStudent: boolean;
	login: (credentials: LoginCredentials) => Promise<void>;
	startDccLogin: (returnPath?: string) => void;
	completeDccLogin: (secret: string) => Promise<LoginOutcome>;
	logout: () => void;
	retrySession: () => void;
	loginError: string | null;
	loginPending: boolean;
	loginDialogOpen: boolean;
	openLoginDialog: () => void;
	closeLoginDialog: () => void;
}
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({
	children,
	owner = session,
}: {
	children: ReactNode;
	owner?: Session;
}) {
	const queryClient = useQueryClient();
	const state = useSyncExternalStore(owner.subscribe, owner.getSnapshot);
	const [loginDialogOpen, setLoginDialogOpen] = useState(false);
	const [loginError, setLoginError] = useState<string | null>(null);
	const [cacheEpoch, setCacheEpoch] = useState(0);
	useEffect(
		() =>
			owner.connect(() => {
				queryClient.clear();
				// Removed queries have detached observers. Remount consumers so
				// public pages reload and account-specific local state is discarded.
				setCacheEpoch((current) => current + 1);
			}),
		[owner, queryClient],
	);
	useEffect(() => {
		if (state.status === "authenticated" || (!state.pending && state.issue)) {
			setLoginDialogOpen(false);
			setLoginError(null);
		}
	}, [state.status, state.pending, state.issue]);
	const login = useCallback(
		async (credentials: LoginCredentials) => {
			setLoginError(null);
			const outcome = await owner.login(credentials);
			if (outcome.status === "failed" && !owner.getSnapshot().issue)
				setLoginError("No pudimos iniciar sesión con esas credenciales.");
			if (outcome.status === "accepted") setLoginDialogOpen(false);
		},
		[owner],
	);
	const openLoginDialog = useCallback(() => {
		setLoginError(null);
		setLoginDialogOpen(true);
	}, []);
	const closeLoginDialog = useCallback(() => {
		setLoginError(null);
		setLoginDialogOpen(false);
		// Invalidate the attempt so a late response cannot sign in after Cancel.
		if (owner.getSnapshot().pending) void owner.logout();
	}, [owner]);
	const value = useMemo<AuthContextValue>(
		() => ({
			user: state.user,
			status: state.status,
			issue: state.issue,
			isAuthenticated: state.status === "authenticated",
			isAdmin: state.user?.role === "admin" || state.user?.role === "mod",
			isStudent: state.user !== null && state.user.role !== "admin",
			login,
			completeDccLogin: owner.completeDccLogin,
			startDccLogin: (path) => {
				void owner.startDccLogin(path);
			},
			logout: () => {
				setLoginDialogOpen(false);
				setLoginError(null);
				void owner.logout();
			},
			retrySession: () => {
				void owner.retry();
			},
			loginPending: state.pending,
			loginError,
			loginDialogOpen,
			openLoginDialog,
			closeLoginDialog,
		}),
		[
			state,
			login,
			owner,
			loginError,
			loginDialogOpen,
			openLoginDialog,
			closeLoginDialog,
		],
	);
	return (
		<AuthContext.Provider value={value}>
			{state.issue && (
				<Alert
					severity={state.issue === "expired" ? "warning" : "error"}
					action={
						state.status === "error" ? (
							<Button color="inherit" onClick={value.retrySession}>
								Reintentar
							</Button>
						) : undefined
					}
				>
					{state.issue === "verification"
						? "No pudimos verificar tu sesión. Puedes seguir explorando y reintentar."
						: state.issue === "storage"
							? "No pudimos guardar los cambios de sesión en este navegador. Reintenta antes de ingresar."
							: state.issue === "denied"
								? "Tu cuenta no tiene acceso a Ramitos."
								: "Tu sesión expiró. Vuelve a iniciar sesión para continuar."}
				</Alert>
			)}
			{/* The callback retains its one-time URL data until it navigates away. */}
			<Fragment
				key={
					window.location.pathname === "/auth/dcc/callback"
						? "dcc-callback"
						: cacheEpoch
				}
			>
				{children}
			</Fragment>
		</AuthContext.Provider>
	);
}
export function useAuth() {
	const value = useContext(AuthContext);
	if (!value) throw new Error("useAuth must be used within AuthProvider");
	return value;
}
