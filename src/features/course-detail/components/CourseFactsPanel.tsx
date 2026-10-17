// Retained for reference; the course page currently shows its title and description here instead.
import { Box, CardActionArea, Chip, Stack, Typography } from "@mui/material";
import { Link } from "@tanstack/react-router";
import { getReviewTagLabel } from "../../../constants/reviewTags";
import { DEFAULT_REVIEW_SORT } from "../../../constants/reviews";
import CategoryIcon from "../../../shared/components/CategoryIcon";
import type { Curso } from "../../../shared/types/domain";
import { CURRENT_SEMESTER } from "../api/courseDetail.api";
import SemesterGraph from "./SemesterGraph";

const planLabels: Record<string, string> = {
	obligatorio: "Obligatorio",
	electivo_licenciatura: "Electivo Licenciatura",
	electivo_especialidad: "Electivo Especialidad",
};

export function CourseFactsPanel({
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
				borderRadius: 1.5,
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
							sx={{
								fontWeight: 600,
								fontSize: "0.8rem",
								minWidth: 0,
								overflowWrap: "anywhere",
							}}
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
						label={getReviewTagLabel(tag)}
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
		<Box sx={{ mt: 1 }}>
			<Typography variant="caption" color="text.secondary">
				Relacionados
			</Typography>
			<Box
				sx={{
					display: "flex",
					gap: 1,
					pb: 0.5,
					overflowX: "auto",
					scrollSnapType: "x proximity",
				}}
			>
				{courses.map((course) => (
					<Box
						key={course.id}
						sx={{
							flex: "0 0 auto",
							scrollSnapAlign: "start",
							maxWidth: 150,
							borderRadius: 0.75,
							p: 0.75,
							border: "1px solid",
							borderColor: "divider",
						}}
					>
						<CardActionArea>
							<Link
								to="/curso/$cursoId"
								params={{ cursoId: course.id }}
								search={{ reviewSort: DEFAULT_REVIEW_SORT }}
								style={{ textDecoration: "none", color: "inherit" }}
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
							</Link>
						</CardActionArea>
					</Box>
				))}
			</Box>
		</Box>
	);
}
