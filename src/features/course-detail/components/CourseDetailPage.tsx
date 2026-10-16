import { useNavigate, Link } from "@tanstack/react-router";
import {
	Box,
	Breadcrumbs,
	Button,
	CircularProgress,
	Divider,
	Fade,
	Typography,
} from "@mui/material";
import BackIcon from "@mui/icons-material/ArrowBack";
import {
	getAverageScore,
	getRadarColor,
} from "../../../constants/courseDisplay";
import type { Curso, ReviewSort } from "../../../shared/types/domain";
import { CourseReviewsSection } from "../../reviews";
import { useCourseDetail } from "../hooks/useCourseDetail";
import CourseRadar from "./CourseRadar";
import { CourseTagSummary } from "./CourseTagSummary";

interface CourseDetailPageProps {
	cursoId: string;
	reviewSort: ReviewSort;
	reviewId?: number;
}

export function CourseDetailPage({
	cursoId,
	reviewSort,
	reviewId,
}: CourseDetailPageProps) {
	const navigate = useNavigate({ from: "/curso/$cursoId" });
	const courseQuery = useCourseDetail(cursoId);

	if (courseQuery.isPending) {
		return (
			<Box sx={{ display: "flex", justifyContent: "center", py: 12 }}>
				<CircularProgress />
			</Box>
		);
	}

	if (courseQuery.isError)
		return (
			<Box sx={{ py: 6, textAlign: "center" }}>
				<Typography>No pudimos cargar el curso.</Typography>
				<Button onClick={() => void courseQuery.refetch()}>Reintentar</Button>
			</Box>
		);
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

	return (
		<Fade in>
			<Box sx={{ maxWidth: 860, mx: "auto" }}>
				<CourseBreadcrumbs courseCode={course.code} />
				<CourseOverview course={course} />

				<Divider sx={{ my: 3 }} />

				<CourseReviewsSection
					reviewable={course.reviewable}
					commentReviewCount={course.commentReviewCount}
					cursoId={cursoId}
					reviewSort={reviewSort}
					reviewId={reviewId}
					onReviewSortChange={(nextSort) =>
						void navigate({
							search: { reviewSort: nextSort, reviewId },
							replace: true,
						})
					}
				/>
			</Box>
		</Fade>
	);
}

function CourseBreadcrumbs({ courseCode }: { courseCode: string }) {
	return (
		<Breadcrumbs sx={{ mb: 2 }}>
			<Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
				<Typography variant="body2" color="text.secondary">
					Cursos
				</Typography>
			</Link>
			<Typography variant="body2" color="text.primary">
				{courseCode}
			</Typography>
		</Breadcrumbs>
	);
}

function CourseHeader({ course }: { course: Curso }) {
	return (
		<Box>
			<Typography
				variant="h3"
				component="h1"
				sx={{
					mb: 1.5,
					lineHeight: 1.2,
					fontSize: { xs: "1.75rem", sm: "2.25rem" },
					overflowWrap: "anywhere",
				}}
			>
				{course.code} - {course.name}
			</Typography>
			<Typography
				variant="body1"
				color="text.secondary"
				sx={{ lineHeight: 1.65 }}
			>
				{course.description}
			</Typography>
			<CourseTagSummary tags={course.reviewTags} />
		</Box>
	);
}

function CourseOverview({ course }: { course: Curso }) {
	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: { xs: "column", md: "row" },
				gap: 3,
				mb: 4,
			}}
		>
			<Box
				sx={{
					flex: "0 0 auto",
					width: { xs: "100%", md: 340 },
					display: "flex",
					flexDirection: "column",
					gap: 2,
				}}
			>
				<CourseScoreSummary course={course} />
			</Box>

			<Box
				sx={{
					flex: 1,
					minWidth: 0,
					alignSelf: "flex-start",
				}}
			>
				<CourseHeader course={course} />
			</Box>
		</Box>
	);
}

function CourseScoreSummary({ course }: { course: Curso }) {
	const avg = getAverageScore(course.ratings);

	const formatter = new Intl.NumberFormat("en-US", {
		minimumFractionDigits: 1,
		maximumFractionDigits: 20,
	});

	return (
		<Box
			sx={{
				bgcolor: "background.paper",
				borderRadius: 1.5,
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
					color: (theme) =>
						course.reviewCount > 0
							? getRadarColor(theme, avg)
							: theme.palette.text.secondary,
					lineHeight: 1,
					mb: -0.5,
				}}
			>
				{course.reviewCount > 0 ? formatter.format(avg) : "-.-"}
			</Typography>
			<Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
				{course.reviewCount} opiniones
			</Typography>
			<CourseRadar ratings={course.ratings} />
		</Box>
	);
}
