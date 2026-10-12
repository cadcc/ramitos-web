import {
	Alert,
	Box,
	Button,
	Typography,
	CircularProgress,
	Stack,
	Fade,
	TextField,
	MenuItem,
} from "@mui/material";
import AdminIcon from "@mui/icons-material/AdminPanelSettings";
import { Ordering } from "../api/adminReviews.api";
import { useAdminReviews } from "../hooks/useAdminReviews";
import { AdminReviewCard } from "../../reviews";

export function AdminDashboard() {
	const {
		reviews,
		reviewsQuery,
		toggleHidden,
		page,
		pageSize,
		createdOrder,
		hasNextPage,
		nextPage,
		previousPage,
		setPageSize,
		setCreatedOrder,
	} = useAdminReviews();
	return (
		<Fade in>
			<Box>
				<Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
					<AdminIcon color="primary" />
					<Typography
						variant="h3"
						sx={{
							fontWeight: 700,
							fontSize: { xs: "1.5rem", sm: "2.25rem" },
							lineHeight: 1.15,
						}}
					>
						Panel de Moderación
					</Typography>
				</Box>
				<Stack
					direction={{ xs: "column", sm: "row" }}
					spacing={2}
					sx={{ mb: 3, justifyContent: "flex-end" }}
				>
					<TextField
						select
						label="Orden de creación"
						size="small"
						value={createdOrder}
						onChange={(event) =>
							setCreatedOrder(event.target.value as Ordering)
						}
						sx={{ minWidth: 220 }}
					>
						<MenuItem value={Ordering.desc}>Más recientes primero</MenuItem>
						<MenuItem value={Ordering.asc}>Más antiguas primero</MenuItem>
					</TextField>
				</Stack>
				{reviewsQuery.isPending ? (
					<Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
						<CircularProgress aria-label="Cargando opiniones" />
					</Box>
				) : reviewsQuery.isError ? (
					<Alert
						severity="error"
						action={
							<Button
								color="inherit"
								onClick={() => void reviewsQuery.refetch()}
								disabled={reviewsQuery.isFetching}
							>
								Reintentar
							</Button>
						}
					>
						No se pudieron cargar las opiniones. Inténtalo de nuevo.
					</Alert>
				) : reviews.length === 0 ? (
					<Typography role="status" color="text.secondary" sx={{ py: 4 }}>
						No hay opiniones en esta página.
					</Typography>
				) : (
					<Stack spacing={2}>
						{reviews.map((review) => (
							<AdminReviewCard
								key={review.id}
								review={review}
								showCourseName={review.courseName}
								accountId={review.accountId}
								onHide={toggleHidden}
							/>
						))}
					</Stack>
				)}
				<Stack
					component="nav"
					aria-label="Paginación de opiniones"
					direction={{ xs: "column", sm: "row" }}
					spacing={2}
					sx={{ mt: 3, alignItems: "center", justifyContent: "space-between" }}
				>
					<TextField
						select
						label="Opiniones por página"
						size="small"
						value={pageSize}
						onChange={(event) => setPageSize(Number(event.target.value))}
						sx={{ minWidth: 190 }}
					>
						{[10, 15, 25, 50].map((size) => (
							<MenuItem key={size} value={size}>
								{size}
							</MenuItem>
						))}
					</TextField>
					<Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
						<Button
							onClick={previousPage}
							disabled={page === 1 || reviewsQuery.isFetching}
						>
							Anterior
						</Button>
						<Typography variant="body2" aria-live="polite">
							Página {page}
						</Typography>
						<Button
							onClick={nextPage}
							disabled={!hasNextPage || reviewsQuery.isFetching}
						>
							Siguiente
						</Button>
					</Stack>
				</Stack>
			</Box>
		</Fade>
	);
}
