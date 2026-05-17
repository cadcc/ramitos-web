import { useNavigate, Link } from "@tanstack/react-router";
import {
	Box,
	Breadcrumbs,
	Button,
	Chip,
	CircularProgress,
	Divider,
	Fade,
	Stack,
	Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { ArrowBack as BackIcon } from "@mui/icons-material";
import { getAverageScore, getTagColor } from "../../../constants/courseDisplay";
import CategoryIcon from "../../../shared/components/CategoryIcon";
import type { Curso, ReviewSort } from "../../../shared/types/domain";
import { CourseReviewsSection } from "../../reviews";
import { CURRENT_SEMESTER, getRelatedCourses } from "../api/courseDetail.api";
import { useCourseDetail } from "../hooks/useCourseDetail";
import CourseRadar from "./CourseRadar";
import SemesterGraph from "./SemesterGraph";

const planLabels: Record<string, string> = {
	obligatorio: "Obligatorio",
	electivo_licenciatura: "Electivo Licenciatura",
	electivo_especialidad: "Electivo Especialidad",
};

interface CourseDetailPageProps {
	cursoId: string;
	reviewSort: ReviewSort;
}

export function CourseDetailPage({
	cursoId,
	reviewSort,
}: CourseDetailPageProps) {
	const navigate = useNavigate({ from: "/curso/$cursoId" });
	const courseQuery = useCourseDetail(cursoId);

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

	return (
		<Fade in>
			<Box sx={{ maxWidth: 860, mx: "auto" }}>
				<CourseBreadcrumbs courseCode={course.code} />
				<CourseHeader course={course} />
				<CourseOverview course={course} cursoId={cursoId} />

				<Divider sx={{ my: 3 }} />

				<CourseReviewsSection
					cursoId={cursoId}
					reviewSort={reviewSort}
					onReviewSortChange={(nextSort) =>
						navigate({ search: { reviewSort: nextSort }, replace: true })
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
		<Box sx={{ mb: 3 }}>
			<Typography variant="h3" sx={{ mb: 0.5, lineHeight: 1.15 }}>
				{course.code} - {course.name}
			</Typography>
			<Typography
				variant="body1"
				color="text.secondary"
				sx={{ lineHeight: 1.65 }}
			>
				{course.description}
			</Typography>
		</Box>
	);
}

function CourseOverview({
	course,
	cursoId,
}: {
	course: Curso;
	cursoId: string;
}) {
	const related = getRelatedCourses(cursoId, 3);

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

			<Box sx={{ flex: 1 }}>
				<CourseFactsPanel course={course} related={related} />
			</Box>
		</Box>
	);
}

function CourseScoreSummary({ course }: { course: Curso }) {
	const avg = getAverageScore(course.ratings);

	return (
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
			<Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
				{course.reviewCount} opiniones
			</Typography>
			<CourseRadar ratings={course.ratings} />

			{course.reviewTags.length > 0 && (
				<Stack
					direction="row"
					spacing={0.5}
					sx={{ flexWrap: "wrap", gap: 0.5, mt: 1, justifyContent: "center" }}
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
	);
}

function CourseFactsPanel({
	course,
	related,
}: {
	course: Curso;
	related: Array<Pick<Curso, "id" | "code" | "name">>;
}) {
	return (
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
					{ label: "Creditos", value: String(course.credits) },
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

			<CourseCategoryTags tags={course.categoryTags} />

			<Box sx={{ mt: 2 }}>
				<Typography
					variant="caption"
					color="text.secondary"
					sx={{ fontSize: "0.78rem", mb: 0.75, display: "block" }}
				>
					Historial de dictacion
				</Typography>
				<SemesterGraph
					semesters={course.semesters}
					currentSemester={CURRENT_SEMESTER}
				/>
			</Box>

			<RelatedCourses courses={related} />
		</Box>
	);
}

function CourseCategoryTags({ tags }: { tags: string[] }) {
	if (tags.length === 0) return null;

	return (
		<Box sx={{ mt: 1.5 }}>
			<Typography
				variant="caption"
				color="text.secondary"
				sx={{ fontSize: "0.78rem", mb: 0.5, display: "block" }}
			>
				Categorias
			</Typography>
			<Stack direction="row" spacing={0.5} sx={{ flexWrap: "wrap", gap: 0.5 }}>
				{tags.map((tag) => (
					<Chip
						key={tag}
						icon={<CategoryIcon category={tag} sx={{ fontSize: 14 }} />}
						label={tag}
						size="small"
						color="primary"
						variant="outlined"
					/>
				))}
			</Stack>
		</Box>
	);
}

function RelatedCourses({
	courses,
}: {
	courses: Array<Pick<Curso, "id" | "code" | "name">>;
}) {
	if (courses.length === 0) return null;

	return (
		<Box sx={{ mt: 2 }}>
			<Typography
				variant="caption"
				color="text.secondary"
				sx={{ fontSize: "0.72rem", mb: 0.5, display: "block" }}
			>
				Relacionados
			</Typography>
			<Box sx={{ display: "flex", gap: 1, overflow: "auto", pb: 0.5 }}>
				{courses.map((course) => (
					<Link
						key={course.id}
						to="/curso/$cursoId"
						params={{ cursoId: course.id }}
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
									bgcolor: (theme) => alpha(theme.palette.primary.main, 0.03),
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
								{course.code}
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
								{course.name}
							</Typography>
						</Box>
					</Link>
				))}
			</Box>
		</Box>
	);
}
