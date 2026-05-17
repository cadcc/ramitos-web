import {
	Box,
	Typography,
	CircularProgress,
	Stack,
	Chip,
	Fade,
} from "@mui/material";
import {
	AdminPanelSettings as AdminIcon,
	Visibility as VisibleIcon,
	VisibilityOff as HiddenIcon,
} from "@mui/icons-material";
import { useAdminReviews } from "../hooks/useAdminReviews";
import { AdminReviewCard } from "../../reviews";

export function AdminDashboard() {
	const {
		loadMoreRef,
		reviews,
		reviewsQuery,
		toggleHidden,
		visibleCount,
		hiddenCount,
	} = useAdminReviews();

	return (
		<Fade in>
			<Box>
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						gap: 1.5,
						mb: 1,
					}}
				>
					<AdminIcon color="primary" />
					<Typography
						variant="h3"
						sx={{
							fontWeight: 700,
						}}
					>
						Panel de Moderación
					</Typography>
				</Box>
				<Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
					Revisa y modera las opiniones publicadas en la plataforma.
				</Typography>

				<Stack direction="row" spacing={1} sx={{ mb: 3 }}>
					<Chip
						icon={<VisibleIcon />}
						label={`${visibleCount} visibles`}
						color="success"
						variant="outlined"
					/>
					<Chip
						icon={<HiddenIcon />}
						label={`${hiddenCount} ocultas`}
						color="error"
						variant="outlined"
					/>
				</Stack>

				{reviewsQuery.isLoading ? (
					<Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
						<CircularProgress />
					</Box>
				) : (
					<Stack spacing={2}>
						{reviews.map((review) => (
							<AdminReviewCard
								key={review.id}
								review={review}
								showCourseName={review.courseName}
								onHide={toggleHidden}
							/>
						))}
					</Stack>
				)}

				<Box
					ref={loadMoreRef}
					sx={{
						height: 40,
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						mt: 2,
					}}
				>
					{reviewsQuery.isFetchingNextPage && <CircularProgress size={24} />}
				</Box>
			</Box>
		</Fade>
	);
}
