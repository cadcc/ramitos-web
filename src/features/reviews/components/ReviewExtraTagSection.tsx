import { useId, useState } from "react";
import { Box, ButtonBase, Collapse, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import type { REVIEW_TAG_SECTIONS } from "../../../constants/reviewTags";
import { ReviewTagOptions } from "./ReviewTagOptions";

interface Props {
	section: (typeof REVIEW_TAG_SECTIONS)[number];
	allAxesRated: boolean;
	selectedTags: string[];
	onToggleTag: (tag: string) => void;
}

export function ReviewExtraTagSection({
	section,
	allAxesRated,
	selectedTags,
	onToggleTag,
}: Props) {
	const id = useId();
	const [state, setState] = useState({
		complete: allAxesRated,
		expanded: allAxesRated,
	});
	// Open on completion, while allowing the user to collapse it again afterwards.
	if (state.complete !== allAxesRated) {
		setState({
			complete: allAxesRated,
			expanded: allAxesRated || state.expanded,
		});
	}
	return (
		<Box>
			<ButtonBase
				onClick={() => setState({ ...state, expanded: !state.expanded })}
				aria-expanded={state.expanded}
				aria-controls={`${id}-tags`}
				id={`${id}-heading`}
				sx={{
					width: "100%",
					justifyContent: "space-between",
					borderRadius: 1,
					py: 0.5,
					textAlign: "left",
				}}
			>
				<Typography
					component="span"
					sx={{
						fontWeight: 700,
						fontSize: "1rem",
						fontFamily: '"Space Grotesk", sans-serif',
					}}
				>
					{section.label}
				</Typography>
				<ExpandMoreIcon
					sx={{
						color: "text.secondary",
						transform: state.expanded ? "rotate(180deg)" : "none",
						transition: "transform 180ms ease",
						"@media (prefers-reduced-motion: reduce)": { transition: "none" },
					}}
				/>
			</ButtonBase>
			<Collapse in={state.expanded} unmountOnExit>
				<Box
					id={`${id}-tags`}
					role="region"
					aria-labelledby={`${id}-heading`}
					sx={{ pt: 0.75 }}
				>
					{section.question && (
						<Typography
							variant="caption"
							color="text.secondary"
							sx={{ display: "block", mb: 0.5 }}
						>
							{section.question}
						</Typography>
					)}
					<ReviewTagOptions
						items={section.items}
						selectedTags={selectedTags}
						onToggleTag={onToggleTag}
					/>
				</Box>
			</Collapse>
		</Box>
	);
}
