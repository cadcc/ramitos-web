import { Box, Chip, Collapse, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { CourseRatings } from "../../../shared/types/domain";
import { AXIS_COLORS, AXIS_TAGS } from "../../../constants/courseDisplay";
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
	const axisTags = AXIS_TAGS[axis.key] ?? [];
	const axisColor = AXIS_COLORS[axis.key] ?? "#666";

	return (
		<Box>
			<Box
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "flex-start",
					gap: 1.5,
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
						{axis.label}
					</Typography>
					<Typography
						variant="caption"
						color="text.secondary"
						sx={{ fontSize: "0.85rem" }}
					>
						{axis.question}
					</Typography>
				</Box>

				<Box
					sx={{
						flexShrink: 0,
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
					}}
				>
					<Box sx={{ display: "flex", gap: "6px" }}>
						{[1, 2, 3, 4, 5].map((value) => {
							const isSelected = selected === value;
							const emoji = axis.emojis[value - 1]!;
							return (
								<Box
									key={value}
									role="button"
									tabIndex={0}
									aria-label={`${axis.label}: ${value} - ${axis.levels[value - 1]}`}
									title={`${axis.levels[value - 1]}`}
									onClick={() => onRatingChange(axis.key, value)}
									onKeyDown={(e) => {
										if (e.key === "Enter" || e.key === " ") {
											e.preventDefault();
											onRatingChange(axis.key, value);
										}
									}}
									sx={{
										width: 40,
										height: 36,
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
							display: "flex",
							justifyContent: "space-between",
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
									maxWidth: "30%",
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
				<Box
					sx={{
						mt: 0.75,
						display: "flex",
						gap: 0.5,
						flexWrap: "wrap",
						alignItems: "center",
					}}
				>
					{axisTags.map((item) =>
						Array.isArray(item) ? (
							<Box
								key={item.join("|")}
								sx={{
									display: "inline-flex",
									border: 1,
									borderColor: alpha(axisColor, 0.35),
									borderRadius: 2,
									overflow: "hidden",
								}}
							>
								{item.map((tag, i) => {
									const isActive = selectedTags.includes(tag);
									return (
										<Box
											key={tag}
											onClick={() => onToggleTag(tag)}
											sx={{
												px: 1.25,
												py: 0.35,
												fontSize: "0.78rem",
												fontWeight: isActive ? 600 : 400,
												cursor: "pointer",
												userSelect: "none",
												transition: "all 0.15s ease",
												borderRight: i === 0 ? 1 : 0,
												borderColor: alpha(axisColor, 0.35),
												...(isActive
													? { bgcolor: axisColor, color: "#fff" }
													: {
															color: axisColor,
															"&:hover": {
																bgcolor: alpha(axisColor, 0.08),
															},
														}),
											}}
										>
											{tag}
										</Box>
									);
								})}
							</Box>
						) : (
							<Chip
								key={item}
								label={item}
								size="small"
								variant={selectedTags.includes(item) ? "filled" : "outlined"}
								onClick={() => onToggleTag(item)}
								sx={{
									fontSize: "0.78rem",
									cursor: "pointer",
									height: 26,
									...(selectedTags.includes(item)
										? {
												bgcolor: axisColor,
												color: "#fff",
												"&:hover": { bgcolor: axisColor },
											}
										: {
												borderColor: alpha(axisColor, 0.4),
												color: axisColor,
											}),
								}}
							/>
						),
					)}
				</Box>
			</Collapse>
		</Box>
	);
}
