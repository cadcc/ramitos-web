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
} from "@mui/material";
import {
	Logout as LogoutIcon,
	Person as PersonIcon,
	Stars as StarsIcon,
	Badge as BadgeIcon,
	AdminPanelSettings as AdminIcon,
} from "@mui/icons-material";
import { Link, useNavigate } from "@tanstack/react-router";
import { LoginDialog, useAuth } from "../../../features/auth";
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
	const { user, isAuthenticated, isAdmin, logout, openLoginDialog } = useAuth();
	const navigate = useNavigate();
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

	const handleMenu = (e: React.MouseEvent<HTMLElement>) =>
		setAnchorEl(e.currentTarget);
	const handleClose = () => setAnchorEl(null);

	const handleLogout = () => {
		handleClose();
		logout();
		navigate({ to: "/" });
	};

	return (
		<>
			<AppBar
				position="sticky"
				elevation={0}
				sx={{
					borderBottom: 1,
					borderTop: "none",
					borderLeft: "none",
					borderRight: "none",
					borderRadius: 0,
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
						<Box sx={{ display: "flex", alignItems: "baseline", gap: 0.3 }}>
							<Typography
								variant="h2"
								sx={{
									fontWeight: 800,
									letterSpacing: "-0.03em",
									fontSize: "1.4rem",
								}}
							>
								ramitos
							</Typography>
							<Typography
								variant="caption"
								sx={{
									fontSize: "0.6rem",
									fontWeight: 500,
								}}
							>
								DCC
							</Typography>
						</Box>
					</Link>

					<Box sx={{ flexGrow: 1 }} />

					<Box
						component={Link}
						to="/malla"
						activeProps={{ "aria-current": "page" }}
						className="app-nav-link"
						sx={{
							display: { xs: "none", sm: "inline-flex" },
							alignItems: "center",
							color: "text.primary",
							textDecoration: "none",
							fontSize: "0.9rem",
							fontWeight: 700,
							lineHeight: 1,
							height: 32,
							px: 0.5,
							borderBottom: 2,
							borderColor: "transparent",
							"&:hover": {
								color: "primary.main",
								borderColor: "primary.main",
							},
							'&[aria-current="page"]': {
								color: "primary.main",
								borderColor: "primary.main",
							},
						}}
					>
						Malla
					</Box>

					{isAuthenticated && user ? (
						<>
							<IconButton onClick={handleMenu} size="small">
								<Avatar
									sx={{
										width: 32,
										height: 32,
										color: "secondary.contrastText",
										bgcolor: "secondary.main",
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

					<ThemeSelector />
				</Toolbar>
			</AppBar>

			<LoginDialog />
		</>
	);
}
