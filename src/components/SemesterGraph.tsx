import { Box, Typography, Tooltip } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import type { RamoSummary } from "../api/types";

interface Props {
	semesters: RamoSummary[];
	currentSemester?: string;
}

const SEMESTER_LABELS = ["Otoño", "Primavera", "Verano"];
const CELL_SIZE = 22;
const CELL_GAP = 3;

function getIntensity(sectionCount: number): number {
	if (sectionCount === 0) return 0;
	if (sectionCount === 1) return 0.3;
	if (sectionCount === 2) return 0.6;
	return 0.9;
}

export default function SemesterGraph({ semesters, currentSemester }: Props) {
	const theme = useTheme();

	const semesterMap = new Map<string, RamoSummary>();
	for (const s of semesters) {
		semesterMap.set(`${s.year}-${s.semester}`, s);
	}

	let minYear = 2026;
	let maxYear = 2022;
	for (const s of semesters) {
		if (s.year < minYear) minYear = s.year;
		if (s.year > maxYear) maxYear = s.year;
	}
	if (maxYear - minYear < 3) {
		minYear = maxYear - 3;
	}

	const years: number[] = [];
	for (let y = minYear; y <= maxYear; y++) {
		years.push(y);
	}

	const primaryColor = theme.palette.primary.main;
	const currentColor = theme.palette.success.main;
	const emptyColor =
		theme.palette.mode === "light"
			? alpha(theme.palette.text.primary, 0.04)
			: alpha(theme.palette.text.primary, 0.06);

	return (
		<Box>
			<Box sx={{ display: "inline-flex", gap: `${CELL_GAP}px` }}>
				<Box
					sx={{
						display: "flex",
						flexDirection: "column",
						gap: `${CELL_GAP}px`,
						justifyContent: "flex-end",
						mr: 0.5,
					}}
				>
					{SEMESTER_LABELS.map((label) => (
						<Box
							key={label}
							sx={{ height: CELL_SIZE, display: "flex", alignItems: "center" }}
						>
							<Typography
								sx={{
									fontSize: "0.6rem",
									color: "text.secondary",
									width: 52,
									textAlign: "right",
									lineHeight: 1,
								}}
							>
								{label}
							</Typography>
						</Box>
					))}
				</Box>

				{years.map((year) => (
					<Box
						key={year}
						sx={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							gap: `${CELL_GAP}px`,
						}}
					>
						<Typography
							sx={{
								fontSize: "0.55rem",
								color: "text.secondary",
								height: 14,
								lineHeight: "14px",
								fontWeight: 600,
							}}
						>
							{year}
						</Typography>
						{[1, 2, 3].map((sem) => {
							const key = `${year}-${sem}`;
							const data = sem <= 2 ? semesterMap.get(key) : undefined;
							const sectionCount = data?.sections.length ?? 0;
							const intensity = getIntensity(sectionCount);
							const isCurrent = currentSemester === key;
							const cellColor = isCurrent ? currentColor : primaryColor;

							const tooltipContent = data ? (
								<Box sx={{ p: 0.5 }}>
									<Typography sx={{ fontSize: "0.75rem", fontWeight: 600 }}>
										{year}-{sem} {SEMESTER_LABELS[sem - 1]}
										{isCurrent && " (actual)"}
									</Typography>
									<Typography
										sx={{
											fontSize: "0.7rem",
											color: "text.secondary",
											mt: 0.25,
										}}
									>
										{sectionCount}{" "}
										{sectionCount === 1 ? "sección" : "secciones"}
									</Typography>
									{data.sections.map((sec, i) => (
										<Typography
											key={sec.id}
											sx={{ fontSize: "0.65rem", mt: 0.25 }}
										>
											S{i + 1}: {sec.professors.join(", ")}
										</Typography>
									))}
								</Box>
							) : (
								<Typography sx={{ fontSize: "0.7rem", p: 0.5 }}>
									No se dictó
								</Typography>
							);

							return (
								<Tooltip
									key={sem}
									title={tooltipContent}
									arrow
									placement="top"
									slotProps={{
										tooltip: {
											sx: {
												bgcolor: "background.paper",
												color: "text.primary",
												border: 1,
												borderColor: "divider",
												boxShadow: 2,
												maxWidth: 220,
											},
										},
										arrow: { sx: { color: "background.paper" } },
									}}
								>
									<Box
										sx={{
											width: CELL_SIZE,
											height: CELL_SIZE,
											borderRadius: "4px",
											bgcolor:
												intensity > 0
													? alpha(cellColor, intensity)
													: emptyColor,
											cursor: "pointer",
											transition: "transform 0.1s ease",
											border:
												isCurrent && intensity > 0
													? `2px solid ${currentColor}`
													: "none",
											"&:hover": {
												transform: "scale(1.2)",
												outline: `2px solid ${alpha(cellColor, 0.5)}`,
												outlineOffset: 1,
											},
										}}
									/>
								</Tooltip>
							);
						})}
					</Box>
				))}
			</Box>

			<Box
				sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1.5, ml: 7 }}
			>
				<Typography sx={{ fontSize: "0.55rem", color: "text.secondary" }}>
					Menos
				</Typography>
				{[0, 0.3, 0.6, 0.9].map((op) => (
					<Box
						key={op}
						sx={{
							width: 10,
							height: 10,
							borderRadius: "2px",
							bgcolor: op > 0 ? alpha(primaryColor, op) : emptyColor,
						}}
					/>
				))}
				<Typography sx={{ fontSize: "0.55rem", color: "text.secondary" }}>
					Más
				</Typography>
				<Box
					sx={{
						width: 10,
						height: 10,
						borderRadius: "2px",
						border: `2px solid ${currentColor}`,
						ml: 1,
					}}
				/>
				<Typography sx={{ fontSize: "0.55rem", color: "text.secondary" }}>
					Actual
				</Typography>
			</Box>
		</Box>
	);
}
