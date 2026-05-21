import { Box, Typography } from "@mui/material";

interface RoadmapCelebrationProps {
	show: boolean;
}

export function RoadmapCelebration({ show }: RoadmapCelebrationProps) {
	if (!show) return null;

	return (
		<Box
			aria-live="polite"
			sx={{
				position: "fixed",
				inset: 0,
				pointerEvents: "none",
				zIndex: 2000,
				overflow: "hidden",
			}}
		>
			<Typography
				sx={{
					position: "absolute",
					top: 80,
					left: "50%",
					transform: "translateX(-50%)",
					px: 2,
					py: 1,
					borderRadius: 2,
					bgcolor: "background.paper",
					boxShadow: 4,
					fontWeight: 800,
				}}
			>
				¡Malla completa!
			</Typography>
			{Array.from({ length: 42 }).map((_, index) => (
				<Box
					key={index}
					sx={{
						position: "absolute",
						top: -24,
						left: `${(index * 37) % 100}%`,
						width: 9,
						height: 14,
						borderRadius: 0.5,
						bgcolor: [
							"primary.main",
							"secondary.main",
							"success.main",
							"warning.main",
						][index % 4],
						animation: `roadmap-confetti-fall ${2.8 + (index % 9) * 0.18}s ease-in forwards`,
						animationDelay: `${(index % 12) * 0.08}s`,
						"@keyframes roadmap-confetti-fall": {
							"0%": {
								transform: "translate3d(0, 0, 0) rotate(0deg)",
								opacity: 1,
							},
							"100%": {
								transform: `translate3d(${index % 2 ? 80 : -80}px, 110vh, 0) rotate(${360 + index * 23}deg)`,
								opacity: 0,
							},
						},
					}}
				/>
			))}
		</Box>
	);
}
