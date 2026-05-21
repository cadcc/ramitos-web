import { Box, Stack } from "@mui/material";
import { useCallback, useRef } from "react";
import { useRoadmapLines } from "../hooks/useRoadmapLines";
import type { ReturnTypeHack } from "../model/viewTypes";
import { DependencyLinesOverlay } from "./DependencyLinesOverlay";
import { PhaseSection } from "./PhaseSection";

interface RoadmapBoardProps {
	state: ReturnTypeHack;
}

export function RoadmapBoard({ state }: RoadmapBoardProps) {
	const boardRef = useRef<HTMLDivElement>(null);
	const lines = useRoadmapLines({
		boardRef,
		cardRefs: state.cardRefs,
		selection: state.selection,
		showLines: state.settings.showLines,
		editMode: state.editMode,
		visibleCourseIds: state.visibleCourseIds,
	});

	const handleCourseClick = useCallback(
		(courseId: string) => {
			if (state.editMode) state.toggleMark(courseId);
			else state.toggleTouchSelection(courseId);
		},
		[state.editMode, state.toggleMark, state.toggleTouchSelection],
	);

	return (
		<Box
			ref={boardRef}
			tabIndex={0}
			aria-label="Malla Curricular"
			sx={{
				position: "relative",
				overflowX: "auto",
				p: { xs: 1, sm: 2 },
				border: 1,
				borderColor: "divider",
				borderRadius: 2,
				bgcolor: "background.paper",
				boxShadow: "0 1px 0 rgba(0,0,0,0.04)",
				contain: "layout paint",
				isolation: "isolate",
			}}
		>
			<DependencyLinesOverlay lines={lines} />
			<Stack
				spacing={2}
				sx={{ minWidth: { xs: 0, md: 920 }, position: "relative" }}
			>
				{state.phases.map((phase) => (
					<PhaseSection
						key={phase.id}
						phase={phase}
						showPhaseLabel={state.settings.showPhases}
						visibleCourseIds={state.visibleCourseIds}
						editMode={state.editMode}
						marks={state.marks}
						editColor={state.editColor}
						selection={state.selection}
						onSelect={state.selectCourse}
						onCourseClick={handleCourseClick}
						onSemesterClick={state.updateSemester}
						registerCard={state.registerCard}
					/>
				))}
			</Stack>
		</Box>
	);
}
