import { useState, type FormEvent } from "react";
import {
	AccountBalance as AccountBalanceIcon,
	Key as KeyIcon,
} from "@mui/icons-material";
import {
	Alert,
	Box,
	Button,
	Collapse,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import { useAuth } from "../providers/AuthProvider";

export function LoginDialog() {
	const {
		login,
		startDccLogin,
		loginError,
		loginPending,
		loginDialogOpen,
		closeLoginDialog,
	} = useAuth();
	const [passwordFormOpen, setPasswordFormOpen] = useState(false);
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");

	const handlePasswordLogin = async (event: FormEvent) => {
		event.preventDefault();
		try {
			await login({ username, password });
		} finally {
			setPassword("");
		}
	};

	const handleClose = () => {
		if (loginPending) return;
		setPasswordFormOpen(false);
		setUsername("");
		setPassword("");
		closeLoginDialog();
	};

	return (
		<Dialog
			open={loginDialogOpen}
			onClose={handleClose}
			maxWidth="xs"
			fullWidth
		>
			<DialogTitle>Ingresar a Ramitos</DialogTitle>
			<DialogContent>
				<Stack spacing={2} sx={{ pt: 0.5 }}>
					<Typography variant="body2" color="text.secondary">
						Usa tu cuenta institucional para publicar y editar opiniones.
					</Typography>

					{loginError && <Alert severity="error">{loginError}</Alert>}

					<Button
						variant="contained"
						size="large"
						startIcon={<AccountBalanceIcon />}
						onClick={() => startDccLogin()}
						disabled={loginPending}
						fullWidth
					>
						Ingresar con cuenta DCC
					</Button>

					<Divider>o</Divider>

					<Button
						variant="text"
						startIcon={<KeyIcon />}
						onClick={() => setPasswordFormOpen((open) => !open)}
						aria-expanded={passwordFormOpen}
					>
						Ingresar con credenciales internas
					</Button>

					<Collapse in={passwordFormOpen} unmountOnExit>
						<Box component="form" onSubmit={handlePasswordLogin}>
							<Stack spacing={1.5}>
								<TextField
									label="Usuario"
									value={username}
									onChange={(event) => setUsername(event.target.value)}
									autoComplete="username"
									disabled={loginPending}
									size="small"
									fullWidth
									required
								/>
								<TextField
									label="Contraseña"
									type="password"
									value={password}
									onChange={(event) => setPassword(event.target.value)}
									autoComplete="current-password"
									disabled={loginPending}
									size="small"
									fullWidth
									required
								/>
								<Button
									type="submit"
									variant="outlined"
									disabled={loginPending}
									fullWidth
								>
									{loginPending ? "Ingresando..." : "Ingresar"}
								</Button>
							</Stack>
						</Box>
					</Collapse>
				</Stack>
			</DialogContent>
			<DialogActions>
				<Button onClick={handleClose} disabled={loginPending}>
					Cancelar
				</Button>
			</DialogActions>
		</Dialog>
	);
}
