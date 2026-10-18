import { useLayoutEffect, useRef } from "react";
import { useMediaQuery } from "@mui/material";

/** A shared animated position keeps the track fill attached to the handle. */
export function useSpringPosition(target: number | undefined) {
	const element = useRef<HTMLDivElement>(null);
	const spring = useRef<{ position: number; velocity: number } | null>(
		target === undefined ? null : { position: target, velocity: 0 },
	);
	const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

	useLayoutEffect(() => {
		const node = element.current;
		if (!node) return;
		if (target === undefined) {
			spring.current = null;
			node.style.setProperty("--slider-position", "0%");
			return;
		}
		const paint = (position: number) => {
			node.style.setProperty(
				"--slider-position",
				`${Math.max(0, Math.min(100, position))}%`,
			);
		};
		if (reducedMotion) {
			spring.current = { position: target, velocity: 0 };
			paint(target);
			return;
		}
		// The unanswered slider starts at the left edge, including on first click.
		if (!spring.current) {
			spring.current = { position: 0, velocity: 0 };
			paint(0);
		}
		const state = spring.current;
		if (state.position === target && state.velocity === 0) {
			paint(target);
			return;
		}
		let previous: number | undefined;
		let frame: number;
		const animate = (time: number) => {
			// Substeps keep the spring stable across different refresh rates.
			let remaining =
				previous === undefined
					? 1 / 60
					: Math.min((time - previous) / 1000, 0.032);
			previous = time;
			while (remaining > 0) {
				const dt = Math.min(remaining, 1 / 120);
				const acceleration =
					(target - state.position) * 400 - state.velocity * 28;
				state.velocity += acceleration * dt;
				state.position += state.velocity * dt;
				remaining -= dt;
			}
			if (
				Math.abs(target - state.position) < 0.015 &&
				Math.abs(state.velocity) < 0.03
			) {
				state.position = target;
				state.velocity = 0;
				paint(target);
				return;
			}
			paint(state.position);
			frame = requestAnimationFrame(animate);
		};
		frame = requestAnimationFrame(animate);
		// Preserve position and momentum when a new tick interrupts the motion.
		return () => cancelAnimationFrame(frame);
	}, [target, reducedMotion]);

	return element;
}
