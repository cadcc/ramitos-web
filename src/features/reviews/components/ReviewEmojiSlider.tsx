import { useId, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import { Box, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { AXIS_COLORS } from "../../../constants/courseDisplay";
import type { ReviewAxisDef } from "../model/reviewForm.model";
import { useSpringPosition } from "../hooks/useSpringPosition";
import { ReviewSliderBubble, ReviewSliderCue } from "./ReviewSliderFeedback";
import type { CourseRatings } from "../../../shared/types/domain";

const axisDirections: Record<keyof CourseRatings, [string, string]> = {
	carga: ["Menos carga", "Más carga"],
	dificultad: ["Más fácil", "Más difícil"],
	docencia: ["Peor docencia", "Mejor docencia"],
	relevancia: ["Menos útil", "Más útil"],
	vibes: ["Peor ambiente", "Mejor ambiente"],
};

interface Props {
	axis: ReviewAxisDef;
	value: number | undefined;
	onChange: (value: number) => void;
}

export function ReviewEmojiSlider({ axis, value, onChange }: Props) {
	const id = useId();
	const pointer = useRef<number | null>(null);
	const touchGesture = useRef<{
		x: number;
		y: number;
		intent: "pending" | "horizontal" | "scroll";
	} | null>(null);
	const lastPointerValue = useRef(value);
	const [preview, setPreview] = useState(3);
	const [feedback, setFeedback] = useState({ value, changed: false });
	// Restored drafts start at their saved values without replaying exclamations.
	if (feedback.value !== value) {
		setFeedback({ value, changed: value !== undefined });
	}
	const color = AXIS_COLORS[axis.key]!;
	const position = ((value ?? 1) - 1) * 25;
	const track = useSpringPosition(value === undefined ? undefined : position);
	const pointerFraction = (event: PointerEvent<HTMLDivElement>) => {
		const bounds = event.currentTarget.getBoundingClientRect();
		return Math.max(
			0,
			Math.min(1, (event.clientX - bounds.left - 22) / (bounds.width - 44)),
		);
	};
	const previewAtPointer = (event: PointerEvent<HTMLDivElement>) => {
		if (value !== undefined || event.pointerType === "touch") return;
		const fraction = pointerFraction(event);
		setPreview(Math.round(fraction * 4) + 1);
		track.current?.style.setProperty("--hover-position", `${fraction * 100}%`);
	};
	const selectAtPointer = (event: PointerEvent<HTMLDivElement>) => {
		const next = Math.round(pointerFraction(event) * 4) + 1;
		if (next === lastPointerValue.current) return;
		if (
			event.pointerType === "touch" &&
			typeof navigator.vibrate === "function"
		) {
			try {
				// One light tap per new tick, never for hover or duplicate events.
				navigator.vibrate(10);
			} catch {
				// Haptics are optional; unsupported or blocked devices still select.
			}
		}
		lastPointerValue.current = next;
		onChange(next);
	};
	const touchIntent = (event: PointerEvent<HTMLDivElement>) => {
		const gesture = touchGesture.current;
		if (!gesture) return "horizontal";
		if (gesture.intent === "pending") {
			const dx = Math.abs(event.clientX - gesture.x);
			const dy = Math.abs(event.clientY - gesture.y);
			// Ignore finger jitter, then lock the gesture's initial direction.
			if (Math.max(dx, dy) >= 10)
				gesture.intent = dy >= dx ? "scroll" : "horizontal";
		}
		return gesture.intent;
	};
	const handleKey = (event: KeyboardEvent<HTMLDivElement>) => {
		let next: number;
		switch (event.key) {
			case "ArrowRight":
			case "ArrowUp":
				next = value === undefined ? 3 : Math.min(5, value + 1);
				break;
			case "ArrowLeft":
			case "ArrowDown":
				next = value === undefined ? 3 : Math.max(1, value - 1);
				break;
			case "Home":
				next = 1;
				break;
			case "End":
				next = 5;
				break;
			case "Enter":
			case " ":
				next = value ?? 3;
				break;
			default:
				return;
		}
		event.preventDefault();
		onChange(next);
	};

	return (
		<Box>
			<Box
				role="slider"
				tabIndex={0}
				aria-label={axis.label}
				aria-describedby={id}
				aria-valuemin={1}
				aria-valuemax={5}
				aria-valuenow={value ?? 3}
				aria-valuetext={
					value === undefined
						? "Sin responder"
						: `${value} de 5: ${axis.levels[value - 1]}`
				}
				onKeyDown={handleKey}
				onFocus={() => {
					track.current?.style.setProperty("--hover-position", "50%");
					setPreview(3);
				}}
				onPointerEnter={previewAtPointer}
				onPointerDown={(event) => {
					if (!event.isPrimary || event.button !== 0) return;
					pointer.current = event.pointerId;
					lastPointerValue.current = value;
					touchGesture.current =
						event.pointerType === "touch"
							? { x: event.clientX, y: event.clientY, intent: "pending" }
							: null;
					event.currentTarget.setPointerCapture(event.pointerId);
					if (event.pointerType !== "touch") {
						event.currentTarget.focus({ preventScroll: true });
						selectAtPointer(event);
					}
				}}
				onPointerMove={(event) => {
					previewAtPointer(event);
					if (
						pointer.current !== event.pointerId ||
						touchIntent(event) !== "horizontal"
					)
						return;
					event.currentTarget.focus({ preventScroll: true });
					selectAtPointer(event);
				}}
				onPointerUp={(event) => {
					if (pointer.current !== event.pointerId) return;
					if (touchIntent(event) !== "scroll") {
						event.currentTarget.focus({ preventScroll: true });
						selectAtPointer(event);
					}
					pointer.current = null;
					touchGesture.current = null;
					event.currentTarget.releasePointerCapture(event.pointerId);
				}}
				onPointerCancel={(event) => {
					if (pointer.current !== event.pointerId) return;
					pointer.current = null;
					touchGesture.current = null;
				}}
				onLostPointerCapture={(event) => {
					if (pointer.current !== event.pointerId) return;
					pointer.current = null;
					touchGesture.current = null;
				}}
				sx={{
					position: "relative",
					height: { xs: 64, md: 56 },
					px: "22px",
					cursor: "pointer",
					touchAction: "pan-y",
					userSelect: "none",
					borderRadius: 2,
					// Themes add global focus glows with !important; keep that treatment
					// on the handle, never on the full-width interaction surface.
					"&&, &&:focus, &&:focus-visible, &&:active": {
						outline: "none !important",
						boxShadow: "none !important",
						border: 0,
						WebkitTapHighlightColor: "transparent",
					},
					"&:focus-visible .emoji-handle": {
						outline: `2px solid ${color}`,
						outlineOffset: 3,
					},
					"&:focus-visible .empty-track-cue": { opacity: 1 },
					"@media (hover: hover) and (pointer: fine)": {
						"&:hover .empty-track-cue": { opacity: 1 },
					},
					"&:hover .emoji-handle": {
						transform: "translate(-50%, -50%) scale(1.08)",
					},
				}}
			>
				<Box
					ref={track}
					sx={{
						position: "relative",
						height: "100%",
						"--track-y": { xs: "50%", md: "28px" },
					}}
				>
					{value === undefined && (
						<ReviewSliderCue color={color} emoji={axis.emojis[preview - 1]!} />
					)}
					<Box
						sx={{
							position: "absolute",
							top: "var(--track-y)",
							left: 0,
							right: 0,
							height: 8,
							mt: "-4px",
							// Square rail ends meet the vertical endpoint marks flush.
							borderRadius: 0,
							bgcolor: "action.hover",
							boxShadow: `inset 0 0 0 1px ${alpha(color, 0.18)}`,
						}}
					>
						<Box
							sx={{
								width: "var(--slider-position, 0%)",
								height: "100%",
								borderRadius: "inherit",
								bgcolor: color,
							}}
						/>
						{[0, 25, 50, 75, 100].map((point) => (
							<Box
								key={point}
								sx={{
									position: "absolute",
									left: `${point}%`,
									top: "50%",
									transform: "translate(-50%, -50%)",
									width: 2,
									height: 12,
									borderRadius: "1px",
									bgcolor:
										value !== undefined &&
										point > 0 &&
										point < 100 &&
										point <= position
											? "background.paper"
											: alpha(color, 0.55),
									pointerEvents: "none",
								}}
							/>
						))}
					</Box>
					{value !== undefined && feedback.changed && (
						<ReviewSliderBubble
							key={value}
							label={axis.levels[value - 1]!}
							value={value}
							color={color}
						/>
					)}
					{value !== undefined && (
						<Box
							className="emoji-handle"
							aria-hidden="true"
							sx={{
								position: "absolute",
								left: "var(--slider-position, 0%)",
								top: "var(--track-y)",
								transform: "translate(-50%, -50%)",
								width: 44,
								height: 44,
								display: "grid",
								placeItems: "center",
								borderRadius: "50%",
								bgcolor: "background.paper",
								border: `2px solid ${alpha(color, 0.35)}`,
								boxShadow: `0 3px 10px ${alpha(color, 0.18)}`,
								fontSize: 28,
								lineHeight: 1,
								transition: "transform 140ms ease",
								"@media (prefers-reduced-motion: reduce)": {
									transition: "none",
								},
							}}
						>
							{axis.emojis[value - 1]}
						</Box>
					)}
				</Box>
			</Box>
			<Box
				sx={{
					display: "flex",
					justifyContent: "space-between",
					gap: 2,
					px: "4px",
					mt: { xs: -1, md: 0 },
				}}
			>
				<Typography
					variant="caption"
					color="text.secondary"
					sx={{
						fontSize: "0.7rem",
						lineHeight: 1.4,
						color: "text.secondary",
						fontWeight: 400,
					}}
				>
					← {axisDirections[axis.key][0]}
				</Typography>
				<Typography
					variant="caption"
					color="text.secondary"
					sx={{
						fontSize: "0.7rem",
						lineHeight: 1.4,
						textAlign: "right",
						color: "text.secondary",
						fontWeight: 400,
					}}
				>
					{axisDirections[axis.key][1]} →
				</Typography>
			</Box>
			<Typography
				id={id}
				variant="caption"
				component="p"
				color="text.secondary"
				sx={{
					position: "absolute",
					width: "1px",
					height: "1px",
					overflow: "hidden",
					clipPath: "inset(50%)",
					whiteSpace: "nowrap",
				}}
			>
				Toca o arrastra la barra para elegir. Con teclado, usa las flechas.
			</Typography>
		</Box>
	);
}
