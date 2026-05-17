import { createRootRoute, Outlet, Link } from "@tanstack/react-router";
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import { Home as HomeIcon } from "@mui/icons-material";
import { AppProviders } from "../app/providers/AppProviders";
import Navbar from "../shared/components/Navbar";
import Footer from "../shared/components/Footer";

function NotFound() {
	return (
		<Box sx={{ textAlign: "center", py: 12 }}>
			<Typography variant="h2" sx={{ mb: 1 }}>
				404
			</Typography>
			<Typography variant="h5" color="text.secondary" sx={{ mb: 3 }}>
				Esta página no existe
			</Typography>
			<Button
				component={Link}
				to="/"
				variant="contained"
				startIcon={<HomeIcon />}
			>
				Volver al inicio
			</Button>
		</Box>
	);
}

function RootErrorComponent() {
	return (
		<Box sx={{ textAlign: "center", py: 12 }}>
			<Typography variant="h4" sx={{ mb: 1 }}>
				Algo salió mal
			</Typography>
			<Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
				Ocurrió un error inesperado. Intenta recargar la página.
			</Typography>
			<Button variant="contained" onClick={() => window.location.reload()}>
				Recargar
			</Button>
		</Box>
	);
}

function RootPending() {
	return (
		<Box
			sx={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				minHeight: "50vh",
			}}
		>
			<CircularProgress />
		</Box>
	);
}

export const Route = createRootRoute({
	component: RootLayout,
	notFoundComponent: NotFound,
	errorComponent: RootErrorComponent,
	pendingComponent: RootPending,
});

function RootLayout() {
	return (
		<AppProviders>
			<Box
				sx={{
					display: "flex",
					flexDirection: "column",
					minHeight: "100vh",
				}}
			>
				<Navbar />
				<Box
					component="main"
					sx={{
						flexGrow: 1,
						width: "100%",
						maxWidth: 1200,
						mx: "auto",
						px: { xs: 2, sm: 3 },
						py: 3,
					}}
				>
					<Outlet />
				</Box>
				<Footer />
			</Box>
		</AppProviders>
	);
}
