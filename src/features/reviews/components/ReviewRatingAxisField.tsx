import { Box, Collapse, Divider, Typography } from "@mui/material";
import { REVIEW_TAG_SECTIONS } from "../../../constants/reviewTags";
import { AXIS_COLORS } from "../../../constants/courseDisplay";
import type { CourseRatings } from "../../../shared/types/domain";
import type { ReviewAxisDef } from "../model/reviewForm.model";
import { ReviewEmojiSlider } from "./ReviewEmojiSlider";
import { ReviewTagOptions } from "./ReviewTagOptions";

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
	const section = REVIEW_TAG_SECTIONS.find(
		(section) => section.axis === axis.key,
	);
	const axisColor = AXIS_COLORS[axis.key]!;
	return (
		<Box sx={{ position: "relative", mb: selected !== undefined ? 0 : 1 }}>
			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: {
						xs: "minmax(0, 1fr)",
						md: "minmax(0, 0.9fr) minmax(0, 1.1fr)",
					},
					gap: { xs: 0, md: 4 },
					alignItems: "center",
				}}
			>
				<Box sx={{ minWidth: 0 }}>
					<Typography
						component="h3"
						sx={{
							fontWeight: 700,
							fontSize: "1rem",
							color: axisColor,
							mb: 0.5,
						}}
					>
						{section?.label ?? axis.label}
					</Typography>
					<Typography
						variant="caption"
						sx={{ fontSize: "0.8rem", color: "text.secondary" }}
					>
						{section?.question ?? axis.question}
					</Typography>
				</Box>
				<ReviewEmojiSlider
					axis={axis}
					value={selected}
					onChange={(value) => onRatingChange(axis.key, value)}
				/>
			</Box>
			<Collapse in={selected !== undefined} unmountOnExit>
				<Box sx={{ mt: 2.25 }}>
					<ReviewTagOptions
						items={section?.items ?? []}
						selectedTags={selectedTags}
						onToggleTag={onToggleTag}
						color={axisColor}
					/>
				</Box>
			</Collapse>
			<Divider
				aria-hidden="true"
				sx={{
					position: "absolute",
					bottom: selected !== undefined ? -12 : -16,
					opacity: 0.5,
					left: 0,
					right: 0,
				}}
			/>
		</Box>
	);
}
