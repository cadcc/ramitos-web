import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { z } from "zod";
import { useState, useRef, useEffect } from "react";
import {
	Box,
	Typography,
	Chip,
	Stack,
	Divider,
	CircularProgress,
	ToggleButtonGroup,
	ToggleButton,
	Button,
	Breadcrumbs,
	Fade,
	Card,
	CardContent,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
	ArrowBack as BackIcon,
	RateReview as ReviewIcon,
} from "@mui/icons-material";
import { getCourseReviews } from "../../api/client";
import {
	CURRENT_SEMESTER,
	getCourseDetail,
	getRelatedCourses,
} from "../../api/courseDetail";
import {
	getAverageScore,
	getTagColor,
} from "../../constants/courseDisplay";
import CategoryIcon from "../../components/CategoryIcon";
import type { ReviewSort } from "../../api/types";
import CourseRadar from "../../components/CourseRadar";
import ReviewCard from "../../components/ReviewCard";
import ReviewForm from "../../components/ReviewForm";
import SemesterGraph from "../../components/SemesterGraph";
import { useAuth } from "../../contexts/AuthContext";

const searchSchema = z.object({
	reviewSort: z.enum(["newest", "top"]).optional().default("newest"),
});

export const Route = createFileRoute("/curso/$cursoId")({
	validateSearch: searchSchema,
	component: CoursePage,
});

const planLabels: Record<string, string> = {
	obligatorio: "Obligatorio",
	electivo_licenciatura: "Electivo Licenciatura",
	electivo_especialidad: "Electivo Especialidad",
};

function CoursePage() {
	const { cursoId } = Route.useParams();
	const { reviewSort } = Route.useSearch();
	const navigate = useNavigate({ from: "/curso/$cursoId" });
	const { isStudent, isAuthenticated, openLoginDialog } = useAuth();
	const loadMoreRef = useRef<HTMLDivElement>(null);
	const [reviewFormOpen, setReviewFormOpen] = useState(false);

	const courseQuery = useQuery({
		queryKey: ["course", cursoId],
		queryFn: () => getCourseDetail(cursoId),
	});

	const reviewsQuery = useInfiniteQuery({
		queryKey: ["reviews", cursoId, reviewSort],
		queryFn: ({ pageParam }) =>
			getCourseReviews(cursoId, reviewSort as ReviewSort, pageParam),
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (last) => last.nextCursor ?? undefined,
	});

	useEffect(() => {
		const el = loadMoreRef.current;
		if (!el) return;
		const observer = new IntersectionObserver(
			(entries) => {
				if (
					entries[0]?.isIntersecting &&
					reviewsQuery.hasNextPage &&
					!reviewsQuery.isFetchingNextPage
				) {
					reviewsQuery.fetchNextPage();
				}
			},
			{ threshold: 0.1 },
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, [
		reviewsQuery.hasNextPage,
		reviewsQuery.isFetchingNextPage,
		reviewsQuery.fetchNextPage,
	]);

	if (courseQuery.isLoading) {
		return (
			<Box sx={{ display: "flex", justifyContent: "center", py: 12 }}>
				<CircularProgress />
			</Box>
		);
	}

	const course = courseQuery.data;
	if (!course) {
		return (
			<Box sx={{ textAlign: "center", py: 12 }}>
				<Typography variant="h5">Curso no encontrado</Typography>
				<Button component={Link} to="/" startIcon={<BackIcon />} sx={{ mt: 2 }}>
					Volver al inicio
				</Button>
			</Box>
		);
	}

	const allReviews = reviewsQuery.data?.pages.flatMap((p) => p.items) ?? [];
	const avg = getAverageScore(course.ratings);
	const related = getRelatedCourses(cursoId, 3);

	const handleOpinar = () => {
		if (isAuthenticated && isStudent) {
			setReviewFormOpen(true);
		} else {
			openLoginDialog();
		}
	};

	return (
		<Fade in>
			<Box sx={{ maxWidth: 860, mx: "auto" }}>
				<Breadcrumbs sx={{ mb: 2 }}>
					<Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
						<Typography variant="body2" color="text.secondary">
							Cursos
						</Typography>
					</Link>
					<Typography variant="body2" color="text.primary">
						{course.code}
					</Typography>
				</Breadcrumbs>

				{/* Header */}
				<Box sx={{ mb: 3 }}>
					<Typography variant="h3" sx={{ mb: 0.5, lineHeight: 1.15 }}>
						{course.code} — {course.name}
					</Typography>
					<Typography
						variant="body1"
						color="text.secondary"
						sx={{ lineHeight: 1.65 }}
					>
						{course.description}
					</Typography>
				</Box>

				{/* Two-column: review results (left) | course facts (right) */}
				<Box
					sx={{
						display: "flex",
						flexDirection: { xs: "column", md: "row" },
						gap: 3,
						mb: 4,
					}}
				>
					{/* Left: Review results */}
					<Box
						sx={{
							flex: "0 0 auto",
							width: { xs: "100%", md: 340 },
							display: "flex",
							flexDirection: "column",
							gap: 2,
						}}
					>
						<Box
							sx={{
								bgcolor: "background.paper",
								borderRadius: 2,
								border: 1,
								borderColor: "divider",
								p: 2,
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
							}}
						>
							<Typography
								sx={{
									fontSize: "2.4rem",
									fontWeight: 800,
									fontFamily: '"Space Grotesk", sans-serif',
									color:
										avg >= 3.5
											? "success.main"
											: avg >= 2.5
												? "warning.main"
												: "error.main",
									lineHeight: 1,
									mb: -0.5,
								}}
							>
								{avg}
							</Typography>
							<Typography
								variant="caption"
								color="text.secondary"
								sx={{ mb: 0.5 }}
							>
								{course.reviewCount} opiniones
							</Typography>
							<CourseRadar ratings={course.ratings} />

							{course.reviewTags.length > 0 && (
								<Stack
									direction="row"
									spacing={0.5}
									sx={{
										flexWrap: "wrap",
										gap: 0.5,
										mt: 1,
										justifyContent: "center",
									}}
								>
									{course.reviewTags.map((tag) => {
										const tagColor = getTagColor(tag);
										return (
											<Chip
												key={tag}
												label={tag}
												size="small"
												sx={
													tagColor
														? {
																borderColor: alpha(tagColor, 0.5),
																color: tagColor,
																borderWidth: 1,
																borderStyle: "solid",
																bgcolor: alpha(tagColor, 0.06),
															}
														: {}
												}
											/>
										);
									})}
								</Stack>
							)}
						</Box>
					</Box>

					{/* Right: Objective facts */}
					<Box sx={{ flex: 1 }}>
						<Box
							sx={{
								bgcolor: "background.paper",
								borderRadius: 2,
								border: 1,
								borderColor: "divider",
								p: 2,
							}}
						>
							<Stack spacing={0.75}>
								{[
									{ label: "Departamento", value: course.department },
									{ label: "Plan", value: planLabels[course.plan] },
									{ label: "Créditos", value: String(course.credits) },
								].map(({ label, value }) => (
									<Box
										key={label}
										sx={{ display: "flex", alignItems: "baseline", gap: 1 }}
									>
										<Typography
											variant="caption"
											color="text.secondary"
											sx={{ fontSize: "0.75rem", flexShrink: 0 }}
										>
											{label}
										</Typography>
										<Typography
											variant="caption"
											sx={{ fontWeight: 600, fontSize: "0.8rem" }}
										>
											{value}
										</Typography>
									</Box>
								))}
							</Stack>

							{course.categoryTags.length > 0 && (
								<Box sx={{ mt: 1.5 }}>
									<Typography
										variant="caption"
										color="text.secondary"
										sx={{ fontSize: "0.78rem", mb: 0.5, display: "block" }}
									>
										Categorías
									</Typography>
									<Stack
										direction="row"
										spacing={0.5}
										sx={{ flexWrap: "wrap", gap: 0.5 }}
									>
										{course.categoryTags.map((tag) => (
											<Chip
												key={tag}
												icon={
													<CategoryIcon category={tag} sx={{ fontSize: 14 }} />
												}
												label={tag}
												size="small"
												color="primary"
												variant="outlined"
											/>
										))}
									</Stack>
								</Box>
							)}

							<Box sx={{ mt: 2 }}>
								<Typography
									variant="caption"
									color="text.secondary"
									sx={{ fontSize: "0.78rem", mb: 0.75, display: "block" }}
								>
									Historial de dictación
								</Typography>
								<SemesterGraph
									semesters={course.semesters}
									currentSemester={CURRENT_SEMESTER}
								/>
							</Box>

							{related.length > 0 && (
								<Box sx={{ mt: 2 }}>
									<Typography
										variant="caption"
										color="text.secondary"
										sx={{ fontSize: "0.72rem", mb: 0.5, display: "block" }}
									>
										Relacionados
									</Typography>
									<Box
										sx={{ display: "flex", gap: 1, overflow: "auto", pb: 0.5 }}
									>
										{related.map((rc) => (
											<Link
												key={rc.id}
												to="/curso/$cursoId"
												params={{ cursoId: rc.id }}
												style={{
													textDecoration: "none",
													color: "inherit",
													flexShrink: 0,
													maxWidth: 150,
												}}
											>
												<Box
													sx={{
														px: 1.25,
														py: 0.75,
														borderRadius: 1.5,
														border: 1,
														borderColor: "divider",
														"&:hover": {
															borderColor: "primary.main",
															bgcolor: (t) =>
																alpha(t.palette.primary.main, 0.03),
														},
														transition: "all 0.15s ease",
													}}
												>
													<Typography
														sx={{
															fontSize: "0.68rem",
															fontWeight: 600,
															whiteSpace: "nowrap",
														}}
													>
														{rc.code}
													</Typography>
													<Typography
														sx={{
															fontSize: "0.6rem",
															color: "text.secondary",
															whiteSpace: "nowrap",
															overflow: "hidden",
															textOverflow: "ellipsis",
														}}
													>
														{rc.name}
													</Typography>
												</Box>
											</Link>
										))}
									</Box>
								</Box>
							)}
						</Box>
					</Box>
				</Box>

				<Divider sx={{ my: 3 }} />

				{/* Reviews section */}
				<Box>
					<Box
						sx={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							mb: 2,
							gap: 1,
						}}
					>
						<Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
							<Typography variant="h5">
								Opiniones ({reviewsQuery.data?.pages[0]?.total ?? 0})
							</Typography>
							<ToggleButtonGroup
								value={reviewSort}
								exclusive
								onChange={(_, val) => {
									if (val)
										navigate({ search: { reviewSort: val }, replace: true });
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
							color="success"
							startIcon={<ReviewIcon />}
							onClick={handleOpinar}
							sx={{
								fontWeight: 700,
								px: 3,
								borderRadius: 3,
								boxShadow: (t) =>
									`0 4px 14px ${alpha(t.palette.success.main, 0.35)}`,
								"&:hover": {
									transform: "translateY(-1px)",
									boxShadow: (t) =>
										`0 6px 20px ${alpha(t.palette.success.main, 0.45)}`,
								},
								transition: "all 0.2s ease",
							}}
						>
							Opinar
						</Button>
					</Box>

					<Stack spacing={1.5} sx={{ mb: 4 }}>
						{reviewsQuery.isLoading ? (
							<Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
								<CircularProgress size={28} />
							</Box>
						) : allReviews.length === 0 ? (
							<Typography
								variant="body1"
								color="text.secondary"
								sx={{ textAlign: "center", py: 4 }}
							>
								Aún no hay opiniones para este curso.
							</Typography>
						) : (
							allReviews.map((review) => (
								<ReviewCard key={review.id} review={review} />
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
				</Box>

				{isStudent && (
					<ReviewForm
						cursoId={cursoId}
						open={reviewFormOpen}
						onClose={() => setReviewFormOpen(false)}
					/>
				)}
			</Box>
		</Fade>
	);
}
