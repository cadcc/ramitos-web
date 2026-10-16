import { Box, Typography } from "@mui/material";
import { AXIS_COLORS } from "../../../constants/courseDisplay";
import {
	REVIEW_TAG_SECTIONS,
	type ReviewTagItem,
} from "../../../constants/reviewTags";

function flattenTags(item: ReviewTagItem): { key: string; label: string }[] {
	if (item.type === "group") return item.items.flatMap(flattenTags);
	return item.type === "tag" ? [item] : item.tags;
}

const sections = REVIEW_TAG_SECTIONS.map((section) => ({
	...section,
	tags: section.items.flatMap(flattenTags),
}));

export function CourseTagSummary({ tags }: { tags: string[] }) {
	const selected = new Set(tags);
	const visibleSections = sections
		.map((section) => ({
			...section,
			tags: section.tags.filter((tag) => selected.has(tag.key)),
		}))
		.filter((section) => section.tags.length > 0);
	if (visibleSections.length === 0) return null;

	return (
		<Box component="section" aria-label="Así lo describen" sx={{ mt: 1 }}>
			{/* <Typography variant="overline" sx={{ letterSpacing: 1.5 }}>
				Así lo describen
			</Typography> */}
			<Box sx={{ mt: 0.5 }}>
				{visibleSections.map((section) => (
					<Box key={section.key} sx={{ py: 0.5, lineHeight: 1.2 }}>
						<Typography
							component="span"
							sx={{
								fontSize: 12,
								fontWeight: 700,
								color:
									(section.axis && AXIS_COLORS[section.axis]) ||
									"text.secondary",
								mr: 1,
							}}
						>
							{section.label}:
						</Typography>
						{section.tags.map((tag, index) => (
							<Box component="span" key={tag.key} sx={{ fontSize: 13 }}>
								{index > 0 && (
									<Box
										component="span"
										sx={{ color: "text.disabled", mx: 0.7 }}
									>
										·
									</Box>
								)}
								<Box component="span" sx={{ display: "inline-block" }}>
									{tag.label}
								</Box>
							</Box>
						))}
					</Box>
				))}
			</Box>
		</Box>
	);
}
