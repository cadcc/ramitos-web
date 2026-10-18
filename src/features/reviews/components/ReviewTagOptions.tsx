import { Box, Chip, Typography } from "@mui/material";
import {
	alpha,
	getContrastRatio,
	lighten,
	useTheme,
} from "@mui/material/styles";
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
	const theme = useTheme();
	const accent = color ?? theme.palette.primary.main;
	const labelColor =
		theme.palette.mode === "dark"
			? lighten(accent, 0.5)
			: theme.palette.text.primary;
	const selectedText =
		getContrastRatio(accent, "#fff") >= getContrastRatio(accent, "#000")
			? "#fff"
			: "#000";
	const renderTag = (
		tag: { key: string; label: string },
		segmented = false,
	) => {
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
					flex: { xs: "1 1 auto", sm: "0 0 auto" },
					minWidth: 0,
					fontSize: "0.78rem",
					"& .MuiChip-label": { px: 0.75 },
					color: labelColor,
					borderColor: alpha(labelColor, 0.5),
					...(selected
						? {
								"&&": {
									bgcolor: accent,
									color: selectedText,
									borderColor: accent,
								},
								"&&:hover": { bgcolor: accent, color: selectedText },
							}
						: {
								"&&:hover": { color: labelColor },
							}),
					"&:focus-visible": {
						outline: "2px solid",
						outlineColor: labelColor,
						outlineOffset: 2,
					},
					...(segmented
						? {
								flex: { xs: 1, sm: "initial" },
								minWidth: 0,
								"&:not(:first-of-type)": {
									borderTopLeftRadius: 0,
									borderBottomLeftRadius: 0,
								},
								"&:not(:last-of-type)": {
									borderTopRightRadius: 0,
									borderBottomRightRadius: 0,
								},
							}
						: {}),
				}}
			/>
		);
	};
	return (
		<Box
			sx={{
				display: "flex",
				width: "100%",
				minWidth: 0,
				flexWrap: "wrap",
				columnGap: 0.75,
				rowGap: 1,
				alignItems: "center",
			}}
		>
			{items.map((item) => {
				if (item.type === "tag") return renderTag(item);
				if (item.type === "collection" || item.type === "group")
					return (
						<Box
							key={item.key}
							role="group"
							aria-label={item.label}
							sx={{
								display: "inline-flex",
								alignItems: "center",
								flexWrap: "wrap",
								columnGap: 0.75,
								rowGap: 0.75,
								width: "100%",
								maxWidth: "100%",
							}}
						>
							<Typography
								component="span"
								variant="caption"
								sx={{
									fontWeight: 400,
									color: labelColor,
									mr: 0.25,
								}}
							>
								{item.label}:
							</Typography>
							<Box
								sx={{
									flex: 1,
									minWidth: 0,
									display: "flex",
									flexWrap: "wrap",
									gap: 0.75,
								}}
							>
								{item.type === "collection" ? (
									item.tags.map((tag) => renderTag(tag))
								) : (
									<ReviewTagOptions
										items={item.items}
										selectedTags={selectedTags}
										onToggleTag={onToggleTag}
										color={color}
									/>
								)}
							</Box>
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
							gap: "1px",
							minHeight: 26,
							isolation: "isolate",
						}}
					>
						{item.tags.map((tag) => renderTag(tag, true))}
					</Box>
				);
			})}
		</Box>
	);
}
