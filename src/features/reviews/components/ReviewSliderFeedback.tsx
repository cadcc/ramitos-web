import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Box } from "@mui/material";
import { alpha } from "@mui/material/styles";

export function ReviewSliderCue({
	color,
	emoji,
}: {
	color: string;
	emoji: string;
}) {
	return (
		<Box
			className="empty-track-cue"
			aria-hidden="true"
			sx={{
				position: "absolute",
				left: "var(--hover-position, 50%)",
				top: "var(--track-y)",
				transform: "translate(-50%, -50%)",
				pointerEvents: "none",
				opacity: 0,
				transition: "opacity 160ms ease",
				zIndex: 1,
				"@media (prefers-reduced-motion: reduce)": {
					transition: "none",
				},
			}}
		>
			<Box
				sx={{
					width: 36,
					height: 36,
					display: "grid",
					placeItems: "center",
					borderRadius: "50%",
					border: `1px solid ${alpha(color, 0.45)}`,
					background: `radial-gradient(circle, ${alpha(color, 0.22)}, ${alpha(color, 0.03)} 70%)`,
					boxShadow: `0 0 14px ${alpha(color, 0.18)}`,
					animation: "trackInvitation 1600ms ease-in-out infinite",
					"@media (prefers-reduced-motion: reduce)": { animation: "none" },
					"@keyframes trackInvitation": {
						"0%, 100%": { transform: "scale(0.9)" },
						"50%": { transform: "scale(1.1)" },
					},
				}}
			>
				<Box
					component="span"
					sx={{
						fontSize: 23,
						lineHeight: 1,
						opacity: 0.45,
						filter: "grayscale(0.2)",
					}}
				>
					{emoji}
				</Box>
			</Box>
		</Box>
	);
}

export function ReviewSliderBubble({
	label,
	value,
	color,
}: {
	label: string;
	value: number;
	color: string;
}) {
	const anchor = value === 1 ? "15%" : value === 5 ? "85%" : "50%";
	const [tilt] = useState(
		() => (Math.random() < 0.5 ? -1 : 1) * (2 + Math.random() * 3),
	);
	const origin = useRef<HTMLDivElement>(null);
	const bubble = useRef<HTMLDivElement>(null);
	useLayoutEffect(() => {
		// Follow the spring-driven anchor outside the modal's clipping surface.
		const until = performance.now() + 1150;
		let frame = 0;
		const follow = () => {
			const bounds = origin.current?.getBoundingClientRect();
			if (!bounds || !bubble.current) return;
			bubble.current.style.left = `${bounds.left}px`;
			bubble.current.style.top = `${bounds.top}px`;
			if (performance.now() < until) frame = requestAnimationFrame(follow);
		};
		follow();
		return () => cancelAnimationFrame(frame);
	}, []);
	return (
		<>
			<Box
				ref={origin}
				aria-hidden="true"
				sx={{
					position: "absolute",
					left: "var(--slider-position, 0%)",
					bottom: "calc(100% - var(--track-y) + 28px)",
					width: 0,
					height: 0,
					pointerEvents: "none",
				}}
			/>
			{createPortal(
				<Box
					ref={bubble}
					aria-hidden="true"
					sx={{
						position: "fixed",
						transform: `translate(-${anchor}, -100%)`,
						pointerEvents: "none",
						zIndex: (theme) => theme.zIndex.tooltip,
					}}
				>
					<Box
						className="level-bubble"
						sx={{
							position: "relative",
							whiteSpace: "nowrap",
							px: 1.25,
							py: 0.5,
							borderRadius: "10px",
							border: `1px solid ${alpha(color, 0.35)}`,
							bgcolor: "background.paper",
							color: "text.primary",
							fontSize: "0.78rem",
							fontWeight: 700,
							boxShadow: `0 3px 10px ${alpha(color, 0.12)}`,
							rotate: `${tilt}deg`,
							animation: "emojiExclamation 1100ms linear both",
							"&::after": {
								content: '""',
								position: "absolute",
								left: anchor,
								bottom: -4,
								width: 6,
								height: 6,
								bgcolor: "background.paper",
								borderRight: `1px solid ${alpha(color, 0.35)}`,
								borderBottom: `1px solid ${alpha(color, 0.35)}`,
								transform: "translateX(-50%) rotate(45deg)",
							},
							"@keyframes emojiExclamation": {
								"0%": { opacity: 1, transform: "translateY(4px) scale(0.96)" },
								"70%": { opacity: 1, transform: "translateY(-12px) scale(1)" },
								"100%": { opacity: 0, transform: "translateY(-20px) scale(1)" },
							},
							"@media (prefers-reduced-motion: reduce)": {
								animationName: "emojiExclamationStill",
								rotate: "none",
							},
							"@keyframes emojiExclamationStill": {
								"0%, 70%": { opacity: 1 },
								"100%": { opacity: 0 },
							},
						}}
					>
						{label}
					</Box>
				</Box>,
				document.body,
			)}
		</>
	);
}
