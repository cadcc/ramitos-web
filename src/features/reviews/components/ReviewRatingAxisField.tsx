import { ReviewTagOptions } from "./ReviewTagOptions";
import { REVIEW_TAG_SECTIONS } from "../../../constants/reviewTags";
import { Box, Collapse, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { CourseRatings } from "../../../shared/types/domain";
import { AXIS_COLORS } from "../../../constants/courseDisplay";
import type { ReviewAxisDef } from "../model/reviewForm.model";

interface ReviewRatingAxisFieldProps {
	axis: ReviewAxisDef;
	selected: number | undefined;
	selectedTags: string[];
	onRatingChange: (axis: keyof CourseRatings, value: number) => void;
	onToggleTag: (tag: string) => void;
}

export function ReviewRatingAxisField({
	axis,
	selected,
	selectedTags,
	onRatingChange,
	onToggleTag,
}: ReviewRatingAxisFieldProps) {
	const axisChosen = selected !== undefined;
	const section = REVIEW_TAG_SECTIONS.find(
		(section) => section.axis === axis.key,
	);
	const axisColor = AXIS_COLORS[axis.key] ?? "#666";

	return (
		<Box>
			<Box
				sx={{
					display: "flex",
					flexDirection: { xs: "column", sm: "row" },
					justifyContent: "space-between",
					alignItems: "flex-start",
					gap: { xs: 0.75, sm: 1.5 },
				}}
			>
				<Box sx={{ flex: 1 }}>
					<Typography
						sx={{
							fontWeight: 700,
							fontSize: "1rem",
							fontFamily: '"Space Grotesk", sans-serif',
							color: axisColor,
						}}
					>
						{section?.label ?? axis.label}
					</Typography>
					<Typography
						variant="caption"
						color="text.secondary"
						sx={{ fontSize: "0.8rem" }}
					>
						{section?.question ?? axis.question}
					</Typography>
				</Box>

				<Box
					sx={{
						flexShrink: 0,
						width: { xs: "100%", sm: "auto" },
						maxWidth: { xs: 320, sm: "none" },
						alignSelf: { xs: "center", sm: "auto" },
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
					}}
				>
					<Box
						sx={{
							display: "grid",
							gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
							gap: { xs: 0.5, sm: "6px" },
							width: "100%",
						}}
					>
						{[1, 2, 3, 4, 5].map((value) => {
							const isSelected = selected === value;
							const emoji = axis.emojis[value - 1]!;
							return (
								<Box
									key={value}
									role="button"
									aria-pressed={isSelected}
									tabIndex={0}
									aria-label={`${section?.label ?? axis.label}: ${value} - ${axis.levels[value - 1]}`}
									title={`${axis.levels[value - 1]}`}
									onClick={() => onRatingChange(axis.key, value)}
									onKeyDown={(e) => {
										if (e.key === "Enter" || e.key === " ") {
											e.preventDefault();
											onRatingChange(axis.key, value);
										}
									}}
									sx={{
										width: { xs: "100%", sm: 40 },
										minWidth: 0,
										height: { xs: 44, sm: 36 },
										borderRadius: 1.5,
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										cursor: "pointer",
										fontSize: "1.35rem",
										lineHeight: 1,
										border: 2,
										borderColor: isSelected ? axisColor : "divider",
										bgcolor: isSelected ? axisColor : "transparent",
										transition: "all 0.15s ease",
										opacity: !axisChosen || isSelected ? 1 : 0.55,
										"&:hover": {
											opacity: 1,
											borderColor: axisColor,
											bgcolor: isSelected ? axisColor : alpha(axisColor, 0.08),
										},
									}}
								>
									{emoji}
								</Box>
							);
						})}
					</Box>
					<Box
						sx={{
							display: "grid",
							gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
							width: "100%",
							mt: 0.4,
							px: "2px",
						}}
					>
						{[0, 2, 4].map((levelIndex) => (
							<Typography
								key={levelIndex}
								sx={{
									fontSize: "0.7rem",
									color: "text.secondary",
									textAlign:
										levelIndex === 0
											? "left"
											: levelIndex === 2
												? "center"
												: "right",
								}}
								component="span"
							>
								{axis.levels[levelIndex]}
							</Typography>
						))}
					</Box>
				</Box>
			</Box>

			<Collapse in={selected !== undefined}>
				<Box sx={{ mt: 0.75 }}>
					<ReviewTagOptions
						items={section?.items ?? []}
						selectedTags={selectedTags}
						onToggleTag={onToggleTag}
						color={axisColor}
					/>
				</Box>
			</Collapse>
		</Box>
	);
}
