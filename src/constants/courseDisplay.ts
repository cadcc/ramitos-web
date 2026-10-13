import { getReviewTagAxis } from "./reviewTags";
import type { CourseRatings } from "../shared/types/domain";

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
export function getAverageScore(ratings: CourseRatings): number {
	return Number(
		(
			(ratings.docencia +
				ratings.relevancia +
				ratings.vibes -
				ratings.carga * 0.3 -
				ratings.dificultad * 0.3) /
			3
		).toFixed(1),
	);
}
