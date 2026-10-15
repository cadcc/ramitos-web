import { getReviewTagAxis } from "./reviewTags";
import type { CourseRatings } from "../shared/types/domain";
import type { Theme } from "@mui/material";

export const AXIS_COLORS: Record<string, string> = {
	carga: "#CB4B16",
	dificultad: "#DC322F",
	docencia: "#268BD2",
	relevancia: "#859900",
	vibes: "#6C71C4",
};

export function getTagColor(tag: string): string | undefined {
	const axis = getReviewTagAxis(tag);
	return axis ? AXIS_COLORS[axis] : undefined;
}

export function getRadarColor(theme: Theme, averageScore: number) {
    return averageScore >= 3.5
        ? theme.palette.success.main
        : averageScore >= 2.5
            ? theme.palette.warning.main
            : theme.palette.error.main;
}

export function getAverageScore(ratings: CourseRatings): number {
	const minScore = 5;
	const maxScore = 25 - minScore;
	const score =
		ratings.docencia +
		ratings.relevancia +
		ratings.vibes +
		(6 - ratings.carga) +
		(6 - ratings.dificultad) -
		minScore;

	const grade = 1.0 + 6.0 * (score / maxScore);

	return Number(grade.toFixed(1));
}
