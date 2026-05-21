import { Box, Stack, Typography } from "@mui/material";
import type {
	RoadmapMarkColor,
	RoadmapMarks,
	RoadmapPhase,
	RoadmapSelection,
} from "../model/types";
import { SemesterRow } from "./SemesterRow";

interface PhaseSectionProps {
	phase: RoadmapPhase;
	showPhaseLabel: boolean;
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

export function PhaseSection({
	phase,
	showPhaseLabel,
	visibleCourseIds,
	editMode,
	marks,
	editColor,
	selection,
	onSelect,
	onCourseClick,
	onSemesterClick,
	registerCard,
}: PhaseSectionProps) {
	const hasVisibleCourses = phase.semesters.some((semester) =>
		semester.courses.some((course) => visibleCourseIds.has(course.id)),
	);
	if (!hasVisibleCourses) return null;

	return (
		<Box
			tabIndex={0}
			aria-label={phase.name}
			sx={{
				display: "flex",
				gap: 1.5,
				borderLeft: { xs: 0, sm: showPhaseLabel ? 2 : 0 },
				borderColor: "divider",
				pl: { xs: 0, sm: showPhaseLabel ? 1.25 : 0 },
			}}
		>
			{showPhaseLabel && (
				<Typography
					sx={{
						display: { xs: "none", sm: "block" },
						writingMode: "vertical-rl",
						textTransform: "uppercase",
						letterSpacing: "0.12em",
						color: "text.secondary",
						fontSize: "0.72rem",
						fontWeight: 800,
						pt: 1,
					}}
				>
					{phase.name}
				</Typography>
			)}

			<Stack spacing={0.25} sx={{ minWidth: 0, flex: 1 }}>
				{phase.semesters.map((semester) => (
					<SemesterRow
						key={semester.id}
						semester={semester}
						visibleCourseIds={visibleCourseIds}
						editMode={editMode}
						marks={marks}
						editColor={editColor}
						selection={selection}
						onSelect={onSelect}
						onCourseClick={onCourseClick}
						onSemesterClick={onSemesterClick}
						registerCard={registerCard}
					/>
				))}
			</Stack>
		</Box>
	);
}
