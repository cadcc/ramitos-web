import confetti from "canvas-confetti";
import { AXIS_COLORS } from "../../../constants/courseDisplay";

export function celebrateReviewPublication() {
	if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
		try {
			navigator.vibrate([20, 45, 30, 45, 50]);
		} catch {
			// Optional haptics must never interrupt publication completion.
		}
	}
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
