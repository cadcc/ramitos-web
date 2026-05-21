import { Box, Stack, Typography } from "@mui/material";
import { roadmapColors } from "../model/tokens";
import type {
	RoadmapMarkColor,
	RoadmapMarks,
	RoadmapSelection,
	RoadmapSemester,
} from "../model/types";
import { RoadmapCourseCard } from "./RoadmapCourseCard";

interface SemesterRowProps {
	semester: RoadmapSemester;
	visibleCourseIds: Set<string>;
	editMode: boolean;
	marks: RoadmapMarks;
	editColor: RoadmapMarkColor;
	selection: RoadmapSelection;
	onSelect: (courseId: string | null) => void;
	onCourseClick: (courseId: string) => void;
	onSemesterClick: (courseIds: string[]) => void;
	registerCard: (courseId: string, el: HTMLElement | null) => void;
}

export function SemesterRow({
	semester,
	visibleCourseIds,
	editMode,
	marks,
	editColor,
	selection,
	onSelect,
	onCourseClick,
	onSemesterClick,
	registerCard,
}: SemesterRowProps) {
	const visibleCourses = semester.courses.filter((course) =>
		visibleCourseIds.has(course.id),
	);
	if (visibleCourses.length === 0) return null;

	return (
		<Box
			tabIndex={0}
			aria-label={`Semestre ${semester.number}`}
			sx={{
				display: "flex",
				flexDirection: { xs: "column", sm: "row" },
				alignItems: { xs: "stretch", sm: "center" },
				gap: 1,
				py: 0.75,
			}}
		>
			<Box
				onClick={() =>
					editMode && onSemesterClick(visibleCourses.map((course) => course.id))
				}
				sx={{
					minWidth: { xs: "auto", sm: 42 },
					alignSelf: { xs: "stretch", sm: "center" },
					position: { xs: "sticky", sm: "static" },
					top: { xs: 56, sm: "auto" },
					zIndex: 3,
					borderRadius: 1,
					px: 1,
					py: 0.75,
					textAlign: "center",
					bgcolor: editMode
						? roadmapColors.marks[editColor]
						: "background.paper",
					color: editMode ? "primary.contrastText" : "text.secondary",
					border: editMode ? 1 : 0,
					borderColor: editMode ? "divider" : "transparent",
					cursor: editMode ? "pointer" : "default",
					fontWeight: 800,
				}}
			>
				<Typography sx={{ fontSize: "0.78rem", fontWeight: 800 }}>
					S{semester.number}
				</Typography>
			</Box>

			<Stack
				role="list"
				aria-label="Cursos"
				direction="row"
				sx={{ flexWrap: "wrap", gap: 1 }}
			>
				{visibleCourses.map((course) => (
					<RoadmapCourseCard
						key={course.id}
						course={course}
						editMode={editMode}
						mark={marks[course.id] ?? 0}
						selection={selection}
						onSelect={onSelect}
						onClick={onCourseClick}
						registerCard={registerCard}
					/>
				))}
			</Stack>
		</Box>
	);
}
