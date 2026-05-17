// TODO: split this?

import {
	AppBar,
	Toolbar,
	Typography,
	Button,
	IconButton,
	Avatar,
	Menu,
	MenuItem,
	Divider,
	Box,
	ListItemIcon,
	ListItemText,
	Tooltip,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Stack,
	TextField,
	Alert,
} from "@mui/material";
import {
	Logout as LogoutIcon,
	Person as PersonIcon,
	Stars as StarsIcon,
	Badge as BadgeIcon,
	AdminPanelSettings as AdminIcon,
} from "@mui/icons-material";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "../../../features/auth";
import { useState } from "react";
import ThemeSelector from "./ThemeSelector";

function getInitials(name: string): string {
	return name
		.split(" ")
		.map((w) => w[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);
}

export default function Navbar() {
	const {
		user,
		isAuthenticated,
		isAdmin,
		login,
		logout,
		loginError,
		loginPending,
		loginDialogOpen,
		openLoginDialog,
		closeLoginDialog,
	} = useAuth();
	const navigate = useNavigate();
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");

	const handleMenu = (e: React.MouseEvent<HTMLElement>) =>
		setAnchorEl(e.currentTarget);
	const handleClose = () => setAnchorEl(null);

	const handleLogout = () => {
		handleClose();
		logout();
		navigate({ to: "/" });
	};

	const handleLoginSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		await login({ username, password });
	};

	return (
		<>
			<AppBar
				position="sticky"
				elevation={0}
				sx={{
					bgcolor: "background.paper",
					color: "text.primary",
					borderBottom: 1,
					borderColor: "divider",
				}}
			>
				<Toolbar sx={{ gap: 1 }}>
					<Link
						to="/"
						style={{
							textDecoration: "none",
							color: "inherit",
							display: "flex",
							alignItems: "center",
						}}
					>
						<Box
							component="img"
							src="/logo.png" // TODO: handle this with vite
							alt="Ramitos"
							sx={{
								height: 36,
								mr: 0.5,
								transition: "transform 0.5s ease",
								"&:hover": { transform: "rotate(360deg)" },
							}}
						/>
						<Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
							<Typography
								variant="h5"
								sx={{
									fontWeight: 800,
									color: "primary.main",
									letterSpacing: "-0.03em",
									fontSize: "1.4rem",
								}}
							>
								ramitos
							</Typography>
							<Typography
								variant="caption"
								sx={{
									color: "text.secondary",
									fontSize: "0.65rem",
									fontWeight: 500,
								}}
							>
								DCC
							</Typography>
						</Box>
					</Link>

					<Box sx={{ flexGrow: 1 }} />

					<ThemeSelector />

					{isAuthenticated && user ? (
						<>
							<IconButton onClick={handleMenu} size="small">
								<Avatar
									sx={{
										width: 32,
										height: 32,
										bgcolor: "primary.main",
										fontSize: "0.8rem",
										fontWeight: 700,
									}}
								>
									{getInitials(user.name)}
								</Avatar>
							</IconButton>
							<Menu
								anchorEl={anchorEl}
								open={Boolean(anchorEl)}
								onClose={handleClose}
								transformOrigin={{ horizontal: "right", vertical: "top" }}
								anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
								slotProps={{
									paper: { sx: { minWidth: 220, mt: 1 } },
								}}
							>
								<MenuItem disabled>
									<ListItemIcon>
										<PersonIcon fontSize="small" />
									</ListItemIcon>
									<ListItemText
										primary={user.name}
										secondary={`ID: ${user.id}`}
									/>
								</MenuItem>
								<MenuItem disabled>
									<ListItemIcon>
										<StarsIcon fontSize="small" />
									</ListItemIcon>
									<ListItemText primary={`${user.score} puntos`} />
								</MenuItem>
								<MenuItem disabled>
									<ListItemIcon>
										<BadgeIcon fontSize="small" />
									</ListItemIcon>
									<ListItemText
										primary={
											user.role === "admin" ? "Administrador" : "Estudiante"
										}
									/>
								</MenuItem>
								{isAdmin && (
									<Box>
										<Divider />
										<MenuItem
											onClick={() => {
												handleClose();
												navigate({ to: "/admin" });
											}}
										>
											<ListItemIcon>
												<AdminIcon fontSize="small" />
											</ListItemIcon>
											<ListItemText primary="Panel Admin" />
										</MenuItem>
									</Box>
								)}
								<Divider />
								<MenuItem onClick={handleLogout}>
									<ListItemIcon>
										<LogoutIcon fontSize="small" />
									</ListItemIcon>
									<ListItemText primary="Cerrar sesión" />
								</MenuItem>
							</Menu>
						</>
					) : (
						<Button variant="contained" size="small" onClick={openLoginDialog}>
							Ingresar
						</Button>
					)}
				</Toolbar>
			</AppBar>

			<Dialog
				open={loginDialogOpen}
				onClose={closeLoginDialog}
				maxWidth="xs"
				fullWidth
			>
				<DialogTitle
					sx={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700 }}
				>
					Ingresar a Ramitos
				</DialogTitle>
				<DialogContent>
					<Box component="form" onSubmit={handleLoginSubmit}>
						<Stack spacing={1.5} sx={{ mt: 0.5 }}>
							{loginError && (
								<Alert severity="error" sx={{ py: 0 }}>
									{loginError}
								</Alert>
							)}
							<TextField
								label="Usuario"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								autoComplete="username"
								size="small"
								fullWidth
								required
							/>
							<TextField
								label="Contrasena"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								autoComplete="current-password"
								size="small"
								fullWidth
								required
							/>
							<Button
								type="submit"
								variant="contained"
								fullWidth
								disabled={loginPending}
							>
								{loginPending ? "Ingresando..." : "Ingresar"}
							</Button>
						</Stack>
					</Box>
				</DialogContent>
				<DialogActions>
					<Button onClick={closeLoginDialog}>Cancelar</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}
