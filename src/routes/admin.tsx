import { Navigate, createFileRoute } from "@tanstack/react-router";
import { Box, CircularProgress, Typography } from "@mui/material";
import { AdminDashboard } from "../features/admin";
import { useAuth } from "../features/auth";

export const Route = createFileRoute("/admin")({ component: AdminRoute });

function AdminRoute() {
	const { status, isAdmin } = useAuth();
	if (status === "checking")
		return (
			<Box sx={{ textAlign: "center", py: 8 }}>
				<CircularProgress aria-label="Verificando sesión" />
			</Box>
		);
	if (status === "error")
		return (
			<Typography sx={{ py: 4 }}>
				Verifica tu sesión para acceder a la administración.
			</Typography>
		);
	if (!isAdmin) return <Navigate to="/" replace />;
	return <AdminDashboard />;
}
