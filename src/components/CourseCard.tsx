import { Card, CardContent, Typography, Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Link } from "@tanstack/react-router";
import type { CursoListItem, CourseRatings } from "../api/types";
import { getAverageScore } from "../constants/courseDisplay";

const CURRENT_SEMESTER = "2026-1";

interface Props {
	course: CursoListItem;
	index: number;
}

const RADAR_KEYS: (keyof CourseRatings)[] = [
	"docencia",
	"vibes",
	"relevancia",
	"carga",
	"dificultad",
];

function MiniRadar({ ratings }: { ratings: CourseRatings }) {
	const size = 38;
	const cx = size / 2;
	const cy = size / 2;
	const r = size / 2 - 3;
	const n = RADAR_KEYS.length;

	const bgPoints = RADAR_KEYS.map((_, i) => {
		const angle = (i * 2 * Math.PI) / n - Math.PI / 2;
		return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
	}).join(" ");

	const dataPoints = RADAR_KEYS.map((key, i) => {
		const val = ratings[key] / 5;
		const angle = (i * 2 * Math.PI) / n - Math.PI / 2;
		return `${cx + r * val * Math.cos(angle)},${cy + r * val * Math.sin(angle)}`;
	}).join(" ");

	return (
		<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
			<polygon
				points={bgPoints}
				fill="none"
				stroke="currentColor"
				strokeWidth={0.5}
				opacity={0.2}
			/>
			<polygon
				points={dataPoints}
				fill="currentColor"
				fillOpacity={0.2}
				stroke="currentColor"
				strokeWidth={1.5}
			/>
		</svg>
	);
}

export default function CourseCard({ course, index }: Props) {
	const theme = useTheme();
	const isCurrent = course.lastOffered === CURRENT_SEMESTER;

	return (
		<Card
			sx={{
				height: "100%",
				display: "flex",
				flexDirection: "column",
				animation: "fadeInUp 0.35s ease both",
				animationDelay: `${index * 40}ms`,
				"@keyframes fadeInUp": {
					from: { opacity: 0, transform: "translateY(8px)" },
					to: { opacity: 1, transform: "translateY(0)" },
				},
				"&:hover": {
					borderColor: "primary.main",
					transform: "translateY(-2px)",
					transition: "all 0.15s ease",
				},
			}}
		>
			<Link
				to="/curso/$cursoId"
				params={{ cursoId: course.id }}
				style={{
					textDecoration: "none",
					color: "inherit",
					display: "flex",
					flexGrow: 1,
				}}
			>
				<CardContent
					sx={{
						display: "flex",
						flexDirection: "column",
						gap: 0.75,
						width: "100%",
						p: 2,
						"&:last-child": { pb: 2 },
						cursor: "pointer",
					}}
				>
					{/* Top: code + name | semester */}
					<Box
						sx={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "flex-start",
							gap: 1,
						}}
					>
						<Box sx={{ minWidth: 0, flex: 1 }}>
							<Typography
								variant="overline"
								color="primary"
								sx={{ fontSize: "0.65rem", lineHeight: 1.4 }}
							>
								{course.code}
							</Typography>
							<Typography
								variant="body1"
								sx={{
									fontFamily: '"Space Grotesk", sans-serif',
									fontWeight: 600,
									fontSize: "0.95rem",
									lineHeight: 1.25,
								}}
							>
								{course.name}
							</Typography>
						</Box>
						<Typography
							variant="caption"
							sx={{
								flexShrink: 0,
								fontSize: "0.7rem",
								fontWeight: 700,
								color: isCurrent ? "success.main" : "text.secondary",
								mt: 0.25,
							}}
						>
							{course.lastOffered}
						</Typography>
					</Box>

					{/* Bottom: opinions | mini radar */}
					<Box
						sx={{
							display: "flex",
							alignItems: "flex-end",
							justifyContent: "space-between",
							mt: "auto",
						}}
					>
						<Typography
							variant="caption"
							color="text.secondary"
							sx={{ fontSize: "0.7rem" }}
						>
							{course.reviewCount} opiniones
						</Typography>
						<Box
							sx={{
								color: (() => {
									const avg = getAverageScore(course.ratings);
									return avg >= 3.5
										? theme.palette.success.main
										: avg >= 2.5
											? theme.palette.warning.main
											: theme.palette.error.main;
								})(),
								lineHeight: 0,
							}}
						>
							<MiniRadar ratings={course.ratings} />
						</Box>
					</Box>
				</CardContent>
			</Link>
		</Card>
	);
}
