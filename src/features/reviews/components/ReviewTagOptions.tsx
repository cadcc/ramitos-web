import { Box, Chip, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { ReviewTagItem } from "../../../constants/reviewTags";

export function ReviewTagOptions({
	items,
	selectedTags,
	onToggleTag,
	color,
}: {
	items: ReviewTagItem[];
	selectedTags: string[];
	onToggleTag: (key: string) => void;
	color?: string;
}) {
	const renderTag = (tag: { key: string; label: string }) => {
		const selected = selectedTags.includes(tag.key);
		return (
			<Chip
				key={tag.key}
				component="button"
				type="button"
				label={tag.label}
				aria-pressed={selected}
				size="small"
				variant={selected ? "filled" : "outlined"}
				color={selected ? "primary" : "default"}
				onClick={() => onToggleTag(tag.key)}
				sx={{
					height: 26,
					fontSize: "0.78rem",
					"& .MuiChip-label": { px: 0.75 },
					...(color
						? {
								color: selected ? "#fff" : color,
								borderColor: alpha(color, 0.4),
								...(selected
									? { bgcolor: color, "&:hover": { bgcolor: color } }
									: {}),
							}
						: {}),
				}}
			/>
		);
	};
	return (
		<Box
			sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, alignItems: "center" }}
		>
			{items.map((item) => {
				if (item.type === "tag") return renderTag(item);
				if (item.type === "collection")
					return (
						<Box
							key={item.key}
							role="group"
							aria-label={item.label}
							sx={{
								display: "inline-flex",
								alignItems: "center",
								flexWrap: "wrap",
								gap: 0.375,
								maxWidth: "100%",
							}}
						>
							<Typography
								component="span"
								variant="caption"
								sx={{
									fontWeight: 700,
									color: color ?? "text.secondary",
									mr: 0.25,
								}}
							>
								{item.label}:
							</Typography>
							{item.tags.map(renderTag)}
						</Box>
					);
				return (
					<Box
						key={item.key}
						role="group"
						aria-label={
							item.label ?? item.tags.map((tag) => tag.label).join(" / ")
						}
						sx={{
							display: "inline-flex",
							width: { xs: "100%", sm: "auto" },
							border: 1,
							borderColor: color ? alpha(color, 0.35) : "divider",
							borderRadius: 2,
							overflow: "hidden",
							minHeight: 26,
							boxSizing: "border-box",
						}}
					>
						{item.tags.map((tag, index) => {
							const selected = selectedTags.includes(tag.key);
							return (
								<Box
									key={tag.key}
									component="button"
									type="button"
									aria-pressed={selected}
									onClick={() => onToggleTag(tag.key)}
									sx={{
										border: 0,
										backgroundColor: "transparent",
										fontFamily: "inherit",
										flex: { xs: 1, sm: "initial" },
										minWidth: 0,
										px: 1.25,
										py: 0.35,
										fontSize: "0.78rem",
										textAlign: "center",
										fontWeight: selected ? 600 : 400,
										cursor: "pointer",
										borderRight: index < item.tags.length - 1 ? 1 : 0,
										borderColor: color ? alpha(color, 0.35) : "divider",
										...(selected
											? { bgcolor: color ?? "primary.main", color: "#fff" }
											: {
													color: color ?? "text.secondary",
													"&:hover": {
														bgcolor: color
															? alpha(color, 0.08)
															: "action.hover",
													},
												}),
									}}
								>
									{tag.label}
								</Box>
							);
						})}
					</Box>
				);
			})}
		</Box>
	);
}
