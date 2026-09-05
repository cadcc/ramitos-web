import { useEffect, useState } from "react";
import {
	CheckCircle as CheckCircleIcon,
	ErrorOutlined as ErrorOutlineIcon,
} from "@mui/icons-material";
import {
	Alert,
	Box,
	Button,
	CircularProgress,
	Stack,
	Typography,
} from "@mui/material";
import { Link } from "@tanstack/react-router";
import {
	clearDccLoginReturnPath,
	getDccLoginReturnPath,
	isDccLoginConfigurationError,
} from "../api/auth.api";
import { useAuth } from "../providers/AuthProvider";

export interface DccLoginCallbackParams {
	returnTo?: string;
	secret?: string;
	status?: string;
	workflow?: string;
}

type CallbackState = "processing" | "success" | "error";
type CallbackError = "configuration" | "rejected";

export function DccLoginCallbackPage({
	returnTo,
	secret,
	status,
	workflow,
}: DccLoginCallbackParams) {
	const { completeDccLogin, startDccLogin } = useAuth();
	const [callback] = useState(() => ({ returnTo, secret, status, workflow }));
	const [callbackState, setCallbackState] =
		useState<CallbackState>("processing");
	const [callbackError, setCallbackError] = useState<CallbackError>("rejected");

	useEffect(() => {
		window.history.replaceState(window.history.state, "", "/auth/dcc/callback");

		if (
			callback.status !== "ok" ||
			callback.workflow !== "dccLogin" ||
			!callback.secret
		) {
			setCallbackState("error");
			return;
		}

		let active = true;
		completeDccLogin(callback.secret)
			.then(() => {
				if (!active) return;
				setCallbackState("success");
				const returnPath = getDccLoginReturnPath(callback.returnTo);
				clearDccLoginReturnPath();
				window.location.replace(returnPath);
			})
			.catch((error: unknown) => {
				if (!active) return;
				setCallbackError(
					isDccLoginConfigurationError(error) ? "configuration" : "rejected",
				);
				setCallbackState("error");
			});

		return () => {
			active = false;
		};
	}, [callback, completeDccLogin]);

	return (
		<Box
			sx={{
				display: "grid",
				placeItems: "center",
				minHeight: { xs: "50vh", sm: "60vh" },
				px: { xs: 1, sm: 0 },
			}}
		>
			<Stack
				spacing={2}
				sx={{
					width: "100%",
					maxWidth: 440,
					alignItems: "center",
					textAlign: "center",
				}}
			>
				{callbackState === "processing" && (
					<>
						<CircularProgress aria-label="Completando inicio de sesión" />
						<Typography
							variant="h4"
							sx={{ fontSize: { xs: "1.75rem", sm: "2.125rem" } }}
						>
							Completando tu ingreso
						</Typography>
						<Typography color="text.secondary">
							Estamos verificando tu cuenta DCC.
						</Typography>
					</>
				)}

				{callbackState === "success" && (
					<>
						<CheckCircleIcon color="success" sx={{ fontSize: 48 }} />
						<Typography
							variant="h4"
							sx={{ fontSize: { xs: "1.75rem", sm: "2.125rem" } }}
						>
							Sesión iniciada
						</Typography>
					</>
				)}

				{callbackState === "error" && (
					<>
						<ErrorOutlineIcon color="error" sx={{ fontSize: 48 }} />
						<Typography
							variant="h4"
							sx={{ fontSize: { xs: "1.75rem", sm: "2.125rem" } }}
						>
							No pudimos completar el ingreso
						</Typography>
						<Alert severity="error" sx={{ width: "100%" }}>
							{callbackError === "configuration"
								? "El servidor de pruebas no permite completar el ingreso desde esta dirección local."
								: "El enlace expiró, ya fue utilizado o la autenticación fue cancelada."}
						</Alert>
						<Stack
							direction={{ xs: "column", sm: "row" }}
							spacing={1}
							sx={{ width: { xs: "100%", sm: "auto" } }}
						>
							<Button
								variant="contained"
								onClick={() => startDccLogin(callback.returnTo)}
								sx={{ minHeight: 44 }}
							>
								Intentar nuevamente
							</Button>
							<Button
								component={Link}
								to="/"
								variant="text"
								sx={{ minHeight: 44 }}
							>
								Volver al inicio
							</Button>
						</Stack>
					</>
				)}
			</Stack>
		</Box>
	);
}
