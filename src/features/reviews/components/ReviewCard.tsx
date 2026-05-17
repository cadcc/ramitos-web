import { useEffect, useMemo, useState } from "react";
import {
	Card,
	CardContent,
	Typography,
	Box,
	IconButton,
	Chip,
	Stack,
	Tooltip,
	Button,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
	ThumbUp as LikeIcon,
	ThumbDown as DislikeIcon,
	SentimentVerySatisfied as FunnyIcon,
} from "@mui/icons-material";
import ReviewCommentMarkdown from "./ReviewCommentMarkdown";
import type { Review } from "../../../shared/types/domain";
import { useAuth } from "../../auth";
import { AXIS_COLORS, getTagColor } from "../../../constants/courseDisplay";

interface Props {
	review: Review;
	showCourseName?: string;
	isOwnReview?: boolean;
	onHide?: (id: number) => void;
}

const axisEntries: {
	key: keyof Review["ratings"];
	abbr: string;
	tooltip: string;
}[] = [
	{ key: "carga", abbr: "CAR", tooltip: "Carga — Tiempo y esfuerzo requerido" },
	{
		key: "dificultad",
		abbr: "DIF",
		tooltip: "Dificultad — Complejidad del contenido",
	},
	{
		key: "docencia",
		abbr: "DOC",
		tooltip: "Docencia — Calidad de clases y apoyo",
	},
	{
		key: "relevancia",
		abbr: "REL",
		tooltip: "Relevancia — Utilidad profesional",
	},
	{ key: "vibes", abbr: "VIB", tooltip: "Vibes — Ambiente general del curso" },
];

function formatDate(d: string) {
	return new Date(d).toLocaleDateString(undefined, {
		day: "numeric",
		month: "short",
		year: "numeric",
	});
}

/** ~2 paragraphs or very long single block → show "Ver más". */
const COLLAPSE_MAX_PARAGRAPHS = 2;
const COLLAPSE_MAX_CHARS = 520;

function getCollapsedExcerpt(md: string): {
	excerpt: string;
	truncated: boolean;
} {
	const t = md.trim();
	if (!t) return { excerpt: "", truncated: false };

	const blocks = t.split(/\n\s*\n/).filter((b) => b.trim());
	if (blocks.length > COLLAPSE_MAX_PARAGRAPHS) {
		return {
			excerpt: blocks.slice(0, COLLAPSE_MAX_PARAGRAPHS).join("\n\n"),
			truncated: true,
		};
	}

	if (t.length > COLLAPSE_MAX_CHARS) {
		let cut = t.slice(0, COLLAPSE_MAX_CHARS);
		const lastSpace = cut.lastIndexOf(" ");
		if (lastSpace > COLLAPSE_MAX_CHARS * 0.55) cut = cut.slice(0, lastSpace);
		return { excerpt: `${cut}…`, truncated: true };
	}

	return { excerpt: t, truncated: false };
}

function ReviewCardBase({
	review,
	showCourseName,
	isOwnReview = false,
	onHide,
}: Props) {
	const { isAuthenticated, openLoginDialog } = useAuth();
	const [activeReactions, setActiveReactions] = useState<Set<string>>(
		new Set(),
	);
	const [commentExpanded, setCommentExpanded] = useState(false);

	const { excerpt, truncated: commentTruncated } = useMemo(
		() => getCollapsedExcerpt(review.comment),
		[review.comment],
	);

	useEffect(() => {
		setCommentExpanded(false);
	}, [review.id]);

	const handleReaction = (type: "like" | "dislike" | "funny") => {
		if (!isAuthenticated) {
			openLoginDialog();
			return;
		}
		setActiveReactions((prev) => {
			const next = new Set(prev);
			if (next.has(type)) next.delete(type);
			else next.add(type);
			return next;
		});
		// TODO(backend): Persist review reactions once reaction endpoints exist, then switch this control to the generated mutation hook.
	};

	return (
		<Card sx={{ opacity: review.hidden ? 0.5 : 1, width: "100%" }}>
			<CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
				<Box sx={{ display: "flex", gap: 2 }}>
					{/* Left: discrete colored dots */}
					<Box
						sx={{
							flexShrink: 0,
							width: 110,
							bgcolor: (t) =>
								alpha(
									t.palette.primary.main,
									t.palette.mode === "light" ? 0.03 : 0.06,
								),
							borderRadius: 1.5,
							p: 1.25,
							display: "flex",
							flexDirection: "column",
							gap: 0.75,
						}}
					>
						{axisEntries.map(({ key, abbr, tooltip }) => {
							const val = review.ratings[key];
							const filled = Math.round(val);
							const color = AXIS_COLORS[key] ?? "#666";

							return (
								<Tooltip title={tooltip} arrow placement="left" key={key}>
									<Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
										<Typography
											sx={{
												fontSize: "0.58rem",
												fontWeight: 700,
												width: 24,
												color,
												fontFamily: "monospace",
											}}
										>
											{abbr}
										</Typography>
										<Box sx={{ display: "flex", gap: "3px" }}>
											{[1, 2, 3, 4, 5].map((dot) => (
												<Box
													key={dot}
													sx={{
														width: 8,
														height: 8,
														borderRadius: "50%",
														bgcolor: dot <= filled ? color : alpha(color, 0.15),
														transition: "background-color 0.2s",
													}}
												/>
											))}
										</Box>
									</Box>
								</Tooltip>
							);
						})}
					</Box>

					{/* Right: content */}
					<Box
						sx={{
							flex: 1,
							minWidth: 0,
							display: "flex",
							flexDirection: "column",
						}}
					>
						<Box
							sx={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "flex-start",
								gap: 1,
								mb: 0.5,
							}}
						>
							<Box>
								{showCourseName && (
									<Typography
										variant="caption"
										color="primary"
										sx={{ fontWeight: 700, display: "block", mb: 0.15 }}
									>
										{showCourseName}
									</Typography>
								)}
								<Typography
									variant="caption"
									color="text.secondary"
									sx={{ fontSize: "0.75rem", fontWeight: 700 }}
								>
									{review.year}-{review.semester}
								</Typography>
							</Box>

							<Stack
								direction="row"
								spacing={0.5}
								sx={{
									flexWrap: "wrap",
									gap: 0.5,
									justifyContent: "flex-end",
								}}
							>
								{isOwnReview && (
									<Chip
										label="Tu opinion"
										size="small"
										color="success"
										variant="outlined"
										sx={{ fontSize: "0.65rem", height: 20, fontWeight: 700 }}
									/>
								)}
								{review.tags.map((tag) => {
									const tagColor = getTagColor(tag);
									return (
										<Chip
											key={tag}
											label={tag}
											size="small"
											sx={{
												fontSize: "0.65rem",
												height: 20,
												...(tagColor
													? {
															borderColor: alpha(tagColor, 0.5),
															color: tagColor,
															borderWidth: 1,
															borderStyle: "solid",
															bgcolor: alpha(tagColor, 0.06),
														}
													: {}),
											}}
										/>
									);
								})}
							</Stack>
						</Box>

						{review.comment.trim() ? (
							<Box sx={{ mb: 1 }}>
								<ReviewCommentMarkdown>
									{commentTruncated && !commentExpanded
										? excerpt
										: review.comment}
								</ReviewCommentMarkdown>
								{commentTruncated && (
									<Button
										size="small"
										onClick={() => setCommentExpanded((v) => !v)}
										sx={{
											mt: 0.5,
											p: 0,
											minWidth: 0,
											fontSize: "0.78rem",
											fontWeight: 600,
											textTransform: "none",
										}}
									>
										{commentExpanded ? "Ver menos" : "Ver más"}
									</Button>
								)}
							</Box>
						) : null}

						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								gap: 0.5,
								mt: "auto",
							}}
						>
							<Tooltip title="Útil" arrow>
								<IconButton
									size="small"
									onClick={() => handleReaction("like")}
									sx={
										activeReactions.has("like") ? { color: "success.main" } : {}
									}
								>
									<LikeIcon sx={{ fontSize: 14 }} />
								</IconButton>
							</Tooltip>
							<Typography
								variant="caption"
								sx={{
									fontSize: "0.7rem",
									mr: 0.5,
									color: activeReactions.has("like")
										? "success.main"
										: "text.secondary",
								}}
							>
								{review.likes + (activeReactions.has("like") ? 1 : 0)}
							</Typography>

							<Tooltip title="No útil" arrow>
								<IconButton
									size="small"
									onClick={() => handleReaction("dislike")}
									sx={
										activeReactions.has("dislike")
											? { color: "error.main" }
											: {}
									}
								>
									<DislikeIcon sx={{ fontSize: 14 }} />
								</IconButton>
							</Tooltip>
							<Typography
								variant="caption"
								sx={{
									fontSize: "0.7rem",
									mr: 0.5,
									color: activeReactions.has("dislike")
										? "error.main"
										: "text.secondary",
								}}
							>
								{review.dislikes + (activeReactions.has("dislike") ? 1 : 0)}
							</Typography>

							<Tooltip title="Chistoso" arrow>
								<IconButton
									size="small"
									onClick={() => handleReaction("funny")}
									sx={
										activeReactions.has("funny")
											? { color: "warning.main" }
											: {}
									}
								>
									<FunnyIcon sx={{ fontSize: 14 }} />
								</IconButton>
							</Tooltip>
							<Typography
								variant="caption"
								sx={{
									fontSize: "0.7rem",
									color: activeReactions.has("funny")
										? "warning.main"
										: "text.secondary",
								}}
							>
								{review.funny + (activeReactions.has("funny") ? 1 : 0)}
							</Typography>

							{onHide && (
								<Box sx={{ ml: "auto" }}>
									<Chip
										label={review.hidden ? "Mostrar" : "Ocultar"}
										size="small"
										variant="outlined"
										onClick={() => onHide(review.id)}
										sx={{ fontSize: "0.65rem", height: 22 }}
									/>
								</Box>
							)}

							<Typography
								variant="caption"
								color="text.secondary"
								sx={{ ml: onHide ? 0 : "auto", fontSize: "0.65rem" }}
							>
								{formatDate(review.createdAt)}
							</Typography>
						</Box>
					</Box>
				</Box>
			</CardContent>
		</Card>
	);
}

export function CourseReviewCard({ review }: Pick<Props, "review">) {
	return <ReviewCardBase review={review} />;
}

export function OwnCourseReviewCard({ review }: Pick<Props, "review">) {
	return <ReviewCardBase review={review} isOwnReview />;
}

export function AdminReviewCard({
	review,
	showCourseName,
	onHide,
}: Pick<Props, "review" | "showCourseName" | "onHide">) {
	return (
		<ReviewCardBase
			review={review}
			showCourseName={showCourseName}
			onHide={onHide}
		/>
	);
}

export default ReviewCardBase;
