import { Box } from "@mui/material";
import type { ReactNode } from "react";
import type { CourseRatings } from "../../../shared/types/domain";

const RADAR_SIZE = 38;
const RADAR_CENTER = RADAR_SIZE / 2;
const RADAR_RADIUS = RADAR_SIZE / 2 - 3;
const RADAR_KEYS: (keyof CourseRatings)[] = [
	"docencia",
	"vibes",
	"relevancia",
	"carga",
	"dificultad",
];

function radarPoints(valueForKey: (key: keyof CourseRatings) => number) {
	return RADAR_KEYS.map((key, index) => {
		const angle = (index * 2 * Math.PI) / RADAR_KEYS.length - Math.PI / 2;
		const value = valueForKey(key);
		return `${RADAR_CENTER + RADAR_RADIUS * value * Math.cos(angle)},${RADAR_CENTER + RADAR_RADIUS * value * Math.sin(angle)}`;
	}).join(" ");
}

const RADAR_OUTLINE_POINTS = radarPoints(() => 1);

function RadarFrame({
	children,
	label,
}: {
	children: ReactNode;
	label?: string;
}) {
	return (
		<Box
			component="svg"
			width={RADAR_SIZE}
			height={RADAR_SIZE}
			viewBox={`0 0 ${RADAR_SIZE} ${RADAR_SIZE}`}
			aria-hidden={label ? undefined : true}
			aria-label={label}
			sx={{ display: "block", flexShrink: 0 }}
		>
			<polygon
				points={RADAR_OUTLINE_POINTS}
				fill="none"
				stroke="currentColor"
				strokeWidth={0.5}
				opacity={0.2}
			/>
			{children}
		</Box>
	);
}

export function MiniRadar({ ratings }: { ratings: CourseRatings }) {
	return (
		<RadarFrame label="Resumen de evaluaciones">
			<polygon
				points={radarPoints((key) => ratings[key] / 5)}
				fill="currentColor"
				fillOpacity={0.2}
				stroke="currentColor"
				strokeWidth={1.5}
			/>
		</RadarFrame>
	);
}

export function MiniRadarSkeleton() {
	return (
		<Box
			sx={{
				color: "text.disabled",
				lineHeight: 0,
				"& polygon:last-of-type": {
					animation: "radarSkeletonPulse 1.5s ease-in-out infinite",
				},
				"@keyframes radarSkeletonPulse": {
					"0%, 100%": { opacity: 0.25 },
					"50%": { opacity: 0.65 },
				},
			}}
		>
			<RadarFrame>
				<polygon
					points={RADAR_OUTLINE_POINTS}
					fill="currentColor"
					fillOpacity={0.2}
					stroke="currentColor"
					strokeWidth={1.5}
				/>
			</RadarFrame>
		</Box>
	);
}
