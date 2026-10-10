import { useState } from "react";
import {
	Box,
	Button,
	CircularProgress,
	Stack,
	ToggleButton,
	ToggleButtonGroup,
	Typography,
} from "@mui/material";
import ReviewIcon from "@mui/icons-material/RateReview";
import type { ReviewSort } from "../../../shared/types/domain";
import { useAuth } from "../../auth";
import { CourseReviewCard, OwnCourseReviewCard } from "./ReviewCard";
import { CreateReviewForm, EditReviewForm } from "./ReviewForm";
import {
	useCourseReviews,
	useOwnCourseReview,
} from "../hooks/useCourseReviews";

interface CourseReviewsSectionProps {
	cursoId: string;
	reviewSort: ReviewSort;
	onReviewSortChange: (sort: ReviewSort) => void;
}

export function CourseReviewsSection({
	cursoId,
	reviewSort,
	onReviewSortChange,
}: CourseReviewsSectionProps) {
	const { user, isAuthenticated, openLoginDialog } = useAuth();
	const [reviewFormOpen, setReviewFormOpen] = useState(false);
	const { reviewsQuery, loadMoreRef, reviews, total } = useCourseReviews(
		cursoId,
		reviewSort,
	);
	const ownReviewQuery = useOwnCourseReview(cursoId, user?.id, isAuthenticated);
	const ownReview = ownReviewQuery.data ?? null;

	const handleOpinar = () => {
		if (isAuthenticated) setReviewFormOpen(true);
		else openLoginDialog();
	};

	return (
		<Box>
			<Box
				sx={{
					display: "flex",
					flexDirection: { xs: "column", sm: "row" },
					justifyContent: "space-between",
					alignItems: { xs: "stretch", sm: "center" },
					mb: 2,
					gap: 1,
				}}
			>
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						gap: 1,
					}}
				>
					<Typography
						variant="h5"
						sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
					>
						Opiniones ({total})
					</Typography>
					<ToggleButtonGroup
						value={reviewSort}
						exclusive
						onChange={(_, val: ReviewSort | null) => {
							if (val) onReviewSortChange(val);
						}}
						size="small"
						sx={{
							"& .MuiToggleButton-root": {
								textTransform: "none",
								fontSize: "0.75rem",
								px: 1.25,
							},
						}}
					>
						<ToggleButton value="newest">Recientes</ToggleButton>
						<ToggleButton value="top">Top</ToggleButton>
					</ToggleButtonGroup>
				</Box>
				<Button
					variant="contained"
					color="primary"
					startIcon={<ReviewIcon />}
					onClick={handleOpinar}
					sx={{
						fontWeight: 700,
						px: 3,
						borderRadius: 3,
						width: { xs: "100%", sm: "auto" },
						minHeight: 44,
						"&:hover": {
							transform: "translateY(-1px)",
						},
						transition: "all 0.2s ease",
					}}
				>
					{ownReview ? "Editar opinion" : "Opinar"}
				</Button>
			</Box>

			<Stack spacing={1.5} sx={{ mb: 4 }}>
				{reviewsQuery.isLoading ? (
					<Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
						<CircularProgress size={28} />
					</Box>
				) : reviewsQuery.isError ? (
					<Typography role="alert" color="error">
						No pudimos cargar las opiniones. Intenta recargar la página.
					</Typography>
				) : reviews.length === 0 ? (
					<Typography
						variant="body1"
						color="text.secondary"
						sx={{ textAlign: "center", py: 4 }}
					>
						Aun no hay opiniones para este curso.
					</Typography>
				) : (
					reviews.map((review) =>
						ownReview?.id === review.id ? (
							<OwnCourseReviewCard key={review.id} review={review} />
						) : (
							<CourseReviewCard key={review.id} review={review} />
						),
					)
				)}
			</Stack>

			<Box
				ref={loadMoreRef}
				sx={{
					height: 40,
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
				}}
			>
				{reviewsQuery.isFetchingNextPage && <CircularProgress size={24} />}
			</Box>

			{isAuthenticated && ownReview && (
				<EditReviewForm
					cursoId={cursoId}
					open={reviewFormOpen}
					onClose={() => setReviewFormOpen(false)}
					initialReview={ownReview}
				/>
			)}
			{isAuthenticated && !ownReview && (
				<CreateReviewForm
					cursoId={cursoId}
					open={reviewFormOpen}
					onClose={() => setReviewFormOpen(false)}
				/>
			)}
		</Box>
	);
}
