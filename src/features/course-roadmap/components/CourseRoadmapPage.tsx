import { useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import { dccRoadmapData } from "../data/dcc";
import { useRoadmapState } from "../hooks/useRoadmapState";
import { RoadmapBoard } from "./RoadmapBoard";
import { RoadmapCelebration } from "./RoadmapCelebration";
import { RoadmapToolbar } from "./RoadmapToolbar";

interface CourseRoadmapPageProps {
	degree: "dcc";
}

export function CourseRoadmapPage({ degree }: CourseRoadmapPageProps) {
	const state = useRoadmapState(
		degree === "dcc" ? dccRoadmapData : dccRoadmapData,
	);
	const [settingsAnchor, setSettingsAnchor] = useState<HTMLElement | null>(
		null,
	);
	const [showCelebration, setShowCelebration] = useState(false);
	const wasComplete = useRef(false);

	useEffect(() => {
		if (state.completion.complete && !wasComplete.current) {
			setShowCelebration(true);
			const timeout = window.setTimeout(() => setShowCelebration(false), 4200);
			wasComplete.current = true;
			return () => window.clearTimeout(timeout);
		}
		wasComplete.current = state.completion.complete;
	}, [state.completion.complete]);

	const handleClearMarks = () => {
		if (window.confirm("Des-marcar todos los cursos marcados?")) {
			state.clearMarks();
		}
	};

	return (
		<Box>
			<RoadmapToolbar
				settings={state.settings}
				settingsAnchor={settingsAnchor}
				editMode={state.editMode}
				editColor={state.editColor}
				onSettingsClick={setSettingsAnchor}
				onSettingsClose={() => setSettingsAnchor(null)}
				onSettingChange={state.updateSetting}
				onEditModeChange={state.setEditMode}
				onEditColorChange={state.setEditColor}
				onClearMarks={handleClearMarks}
			/>
			<RoadmapBoard state={state} />
			<RoadmapCelebration show={showCelebration} />
		</Box>
	);
}
