import confetti from "canvas-confetti";
import { AXIS_COLORS } from "../../../constants/courseDisplay";

export function celebrateReviewPublication() {
	void confetti({
		particleCount: 150,
		spread: 85,
		startVelocity: 45,
		origin: { y: 0.65 },
		colors: Object.values(AXIS_COLORS),
		zIndex: 1600,
		disableForReducedMotion: true,
	});
}
