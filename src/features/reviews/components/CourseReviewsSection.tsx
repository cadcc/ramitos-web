import { useEffect, useRef, useState, type ReactNode } from "react";
import {
	Box,
	Alert,
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
	commentReviewCount: number;
	reviewable?: boolean;
	cursoId: string;
	reviewSort: ReviewSort;
	reviewId?: number;
	onReviewSortChange: (sort: ReviewSort) => void;
}

export function CourseReviewsSection({
	commentReviewCount,
	reviewable,
	cursoId,
	reviewSort,
	reviewId,
	onReviewSortChange,
}: CourseReviewsSectionProps) {
	const { user, isAuthenticated, openLoginDialog } = useAuth();
	const [reviewFormOpen, setReviewFormOpen] = useState(false);
	const { reviewsQuery, loadMoreRef, reviews, targetFound } = useCourseReviews(
		cursoId,
		reviewSort,
		reviewId,
	);
	const ownReviewQuery = useOwnCourseReview(cursoId, user?.id, isAuthenticated);
	const ownReview = ownReviewQuery.data ?? null;

	const handleOpinar = () => {
		if (!isAuthenticated) openLoginDialog();
		else if (ownReview || reviewable === true) setReviewFormOpen(true);
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
						Comentarios ({commentReviewCount})
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
				{isAuthenticated && !ownReview && reviewable !== true ? (
					<Typography variant="body2" color="text.secondary">
						{reviewable === false
							? "No has cursado este ramo."
							: "No pudimos verificar si puedes opinar."}
					</Typography>
				) : (
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
				)}
			</Box>

			<Stack spacing={1.5} sx={{ mb: 4 }}>
				{reviewId !== undefined && !targetFound && !reviewsQuery.isError && (
					<Alert severity="info" role="status">
						{reviewsQuery.isPending || reviewsQuery.hasNextPage
							? "Buscando la opinión enlazada…"
							: "La opinión enlazada no está disponible en este curso."}
					</Alert>
				)}
				{reviewsQuery.isLoading ? (
					<Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
						<CircularProgress size={28} />
					</Box>
				) : reviewsQuery.isError ? (
					<Alert
						severity="error"
						action={
							<Button
								color="inherit"
								disabled={reviewsQuery.isFetching}
								onClick={() =>
									void (reviewsQuery.isFetchNextPageError
										? reviewsQuery.fetchNextPage()
										: reviewsQuery.refetch())
								}
							>
								Reintentar
							</Button>
						}
					>
						No pudimos cargar las opiniones. Inténtalo de nuevo.
					</Alert>
				) : reviews.length === 0 ? (
					<Typography
						variant="body1"
						color="text.secondary"
						sx={{ textAlign: "center", py: 4 }}
					>
						Aun no hay opiniones para este curso.
					</Typography>
				) : (
					reviews.map((review) => (
						<ReviewTarget
							key={review.id}
							reviewId={review.id}
							selected={review.id === reviewId}
						>
							{ownReview?.id === review.id ? (
								<OwnCourseReviewCard key={review.id} review={review} />
							) : (
								<CourseReviewCard key={review.id} review={review} />
							)}
						</ReviewTarget>
					))
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
			{isAuthenticated && !ownReview && reviewable === true && (
				<CreateReviewForm
					cursoId={cursoId}
					open={reviewFormOpen}
					onClose={() => setReviewFormOpen(false)}
				/>
			)}
		</Box>
	);
}

export function ReviewTarget({
	reviewId,
	selected,
	children,
}: {
	reviewId: number;
	selected: boolean;
	children: ReactNode;
}) {
	const ref = useRef<HTMLDivElement>(null);
	useEffect(() => {
		if (!selected) return;
		ref.current?.scrollIntoView({ block: "center" });
		ref.current?.focus({ preventScroll: true });
	}, [selected]);
	return (
		<Box
			ref={ref}
			id={`review-${reviewId}`}
			tabIndex={selected ? -1 : undefined}
			aria-label={selected ? "Opinión enlazada" : undefined}
			sx={{
				scrollMarginTop: 96,
				borderRadius: 2,
				...(selected
					? {
							outline: "2px solid",
							outlineColor: "primary.main",
							outlineOffset: 4,
						}
					: {}),
			}}
		>
			{children}
		</Box>
	);
}
