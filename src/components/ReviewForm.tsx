import { useEffect, useState } from "react";
import {
	Box,
	Typography,
	TextField,
	Button,
	Chip,
	Stack,
	Alert,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Collapse,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Send as SendIcon } from "@mui/icons-material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CourseRatings, ReviewSubmission } from "../api/types";
import type { Review } from "../api/types";
import { submitCourseReview } from "../api/reviewSubmission";
import {
	AXIS_TAGS,
	MODALITY_TAGS,
	AXIS_COLORS,
	type TagItem,
} from "../constants/courseDisplay";
import { MAX_REVIEW_COMMENT_LENGTH } from "../constants/reviews";

interface Props {
	cursoId: string;
	open: boolean;
	onClose: () => void;
	initialReview?: Review | null;
}

interface AxisDef {
	key: keyof CourseRatings;
	label: string;
	question: string;
	/** Screen reader / tooltip labels (1–5). */
	levels: string[];
	/** Shown on Likert buttons; guide row uses [0], [2], [4]. */
	emojis: string[];
}

const axes: AxisDef[] = [
	{
		key: "carga",
		label: "Carga",
		question: "¿Cuánto tiempo y esfuerzo requiere?",
		levels: ["Chacota", "Ligero", "Moderado", "Pesado", "Brutal"],
		emojis: ["🎁", "😴", "😅", "😰", "🥵"],
	},
	{
		key: "dificultad",
		label: "Dificultad",
		question: "¿Qué tan complejo es el contenido?",
		levels: ["Trivial", "Manejable", "Desafiante", "Duro", "Letal"],
		emojis: ["🥱", "😎", "😬", "😫", "💀"],
	},
	{
		key: "docencia",
		label: "Docencia",
		question: "¿Calidad de clases y apoyo?",
		levels: ["Pésimo", "Flojo", "Regular", "Sólido", "Top"],
		emojis: ["😵", "😕", "🙂", "✨", "🎓"],
	},
	{
		key: "relevancia",
		label: "Utilidad",
		question: "¿Qué tan útil es?",
		levels: ["Inútil", "Básico", "Valioso", "Esencial", "Clave"],
		emojis: ["🙃", "🙂", "🤓", "🧠", "🤩"],
	},
	{
		key: "vibes",
		label: "Vibes",
		question: "¿Cómo es el ambiente?",
		levels: ["Tóxico", "Fome", "Normal", "Buena onda", "Energía full"],
		emojis: ["😰", "😐", "🙂", "😊", "🥳"],
	},
];

export default function ReviewForm({
	cursoId,
	open,
	onClose,
	initialReview,
}: Props) {
	const qc = useQueryClient();
	const [ratings, setRatings] = useState<Partial<CourseRatings>>({});
	const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const [comment, setComment] = useState("");

	useEffect(() => {
		if (!open) return;
		setRatings(initialReview?.ratings ?? {});
		setSelectedTags(initialReview?.tags ?? []);
		setComment(initialReview?.comment ?? "");
	}, [initialReview, open]);

	const mutation = useMutation({
		mutationFn: submitCourseReview,
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["reviews", cursoId] });
			qc.invalidateQueries({ queryKey: ["ownReview", cursoId] });
			qc.invalidateQueries({ queryKey: ["course", cursoId] });
			setComment("");
			setSelectedTags([]);
			setRatings({});
			onClose();
		},
	});

	const filledCount = Object.keys(ratings).length;
	const canSubmit = filledCount === 5;

	const handleSubmit = () => {
		if (!canSubmit) return;
		const full: CourseRatings = {
			carga: ratings.carga!,
			dificultad: ratings.dificultad!,
			docencia: ratings.docencia!,
			relevancia: ratings.relevancia!,
			vibes: ratings.vibes!,
		};
		const submission: ReviewSubmission = {
			cursoId,
			// TODO(backend): Review creation does not persist term metadata yet.
			year: 2026,
			semester: 1,
			comment,
			ratings: full,
			tags: selectedTags,
		};
		mutation.mutate(submission);
	};

	const exclusivePartner = new Map<string, string>();
	for (const items of [...Object.values(AXIS_TAGS), MODALITY_TAGS]) {
		for (const item of items) {
			if (Array.isArray(item)) {
				exclusivePartner.set(item[0], item[1]);
				exclusivePartner.set(item[1], item[0]);
			}
		}
	}

	const toggleTag = (tag: string) => {
		setSelectedTags((prev) => {
			if (prev.includes(tag)) return prev.filter((t) => t !== tag);
			const partner = exclusivePartner.get(tag);
			const without = partner ? prev.filter((t) => t !== partner) : prev;
			return [...without, tag];
		});
	};

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="sm"
			fullWidth
			slotProps={{ paper: { sx: { maxHeight: "85vh" } } }}
		>
			<DialogTitle
				sx={{
					fontFamily: '"Space Grotesk", sans-serif',
					fontWeight: 700,
					pb: 0,
					fontSize: "1.25rem",
				}}
			>
				Comparte tu experiencia
			</DialogTitle>
			<DialogContent sx={{ pt: 1.5 }}>
				<Stack spacing={2.5} sx={{ mt: 0.5 }}>
					{axes.map((axis) => {
						const selected = ratings[axis.key];
						const axisChosen = selected !== undefined;
						const axisTags = AXIS_TAGS[axis.key] ?? [];
						const axisColor = AXIS_COLORS[axis.key] ?? "#666";

						return (
							<Box key={axis.key}>
								{/* Title + question (left) | buttons + guide (right) */}
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
														aria-label={`${axis.label}: ${value} — ${axis.levels[value - 1]}`}
														title={`${axis.levels[value - 1]}`}
														onClick={() =>
															setRatings((prev) => ({
																...prev,
																[axis.key]: value,
															}))
														}
														onKeyDown={(e) => {
															if (e.key === "Enter" || e.key === " ") {
																e.preventDefault();
																setRatings((prev) => ({
																	...prev,
																	[axis.key]: value,
																}));
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
															"&:hover": {
																borderColor: axisColor,
																bgcolor: isSelected
																	? axisColor
																	: alpha(axisColor, 0.08),
															},
															"& span.emoji-likert": {
																filter:
																	!axisChosen || isSelected
																		? "none"
																		: "grayscale(1)",
																opacity: !axisChosen || isSelected ? 1 : 0.55,
																transition:
																	"filter 0.15s ease, opacity 0.15s ease",
															},
															"&:hover span.emoji-likert": {
																filter: "none",
																opacity: 1,
															},
															"&:focus-visible span.emoji-likert": {
																filter: "none",
																opacity: 1,
															},
														}}
													>
														<span className="emoji-likert" aria-hidden>
															{emoji}
														</span>
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
											<Typography
												sx={{
													fontSize: "0.7rem",
													color: "text.secondary",
													maxWidth: "30%",
													textAlign: "left",
												}}
												component="span"
											>
												{axis.levels[0]}
											</Typography>
											<Typography
												sx={{
													fontSize: "0.7rem",
													color: "text.secondary",
													textAlign: "center",
												}}
												component="span"
											>
												{axis.levels[2]}
											</Typography>
											<Typography
												sx={{
													fontSize: "0.7rem",
													color: "text.secondary",
													maxWidth: "30%",
													textAlign: "right",
												}}
												component="span"
											>
												{axis.levels[4]}
											</Typography>
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
																onClick={() => toggleTag(tag)}
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
													variant={
														selectedTags.includes(item) ? "filled" : "outlined"
													}
													onClick={() => toggleTag(item)}
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
					})}

					<Box>
						<Typography
							sx={{
								fontWeight: 700,
								fontSize: "1rem",
								fontFamily: '"Space Grotesk", sans-serif',
								mb: 0.25,
							}}
						>
							Modalidad
						</Typography>
						<Typography
							variant="caption"
							color="text.secondary"
							sx={{ fontSize: "0.85rem", display: "block", mb: 0.5 }}
						>
							¿Cómo se estructura el curso?
						</Typography>
						<Box
							sx={{
								display: "flex",
								gap: 0.5,
								flexWrap: "wrap",
								alignItems: "center",
							}}
						>
							{MODALITY_TAGS.map((item) =>
								Array.isArray(item) ? (
									<Box
										key={item.join("|")}
										sx={{
											display: "inline-flex",
											border: 1,
											borderColor: "divider",
											borderRadius: 2,
											overflow: "hidden",
										}}
									>
										{item.map((tag, i) => {
											const isActive = selectedTags.includes(tag);
											return (
												<Box
													key={tag}
													onClick={() => toggleTag(tag)}
													sx={{
														px: 1.25,
														py: 0.35,
														fontSize: "0.78rem",
														fontWeight: isActive ? 600 : 400,
														cursor: "pointer",
														userSelect: "none",
														transition: "all 0.15s ease",
														borderRight: i === 0 ? 1 : 0,
														borderColor: "divider",
														...(isActive
															? { bgcolor: "primary.main", color: "#fff" }
															: {
																	color: "text.secondary",
																	"&:hover": { bgcolor: "action.hover" },
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
										variant={
											selectedTags.includes(item) ? "filled" : "outlined"
										}
										color={selectedTags.includes(item) ? "primary" : "default"}
										onClick={() => toggleTag(item)}
										sx={{ fontSize: "0.78rem", cursor: "pointer", height: 26 }}
									/>
								),
							)}
						</Box>
					</Box>

					<TextField
						label="Comentario (opcional)"
						placeholder="Párrafos con líneas en blanco. También puedes usar Markdown (negritas, listas, enlaces, código…)."
						multiline
						minRows={6}
						maxRows={24}
						value={comment}
						onChange={(e) => setComment(e.target.value)}
						slotProps={{ htmlInput: { maxLength: MAX_REVIEW_COMMENT_LENGTH } }}
						helperText={
							comment.length > 0
								? `${comment.length.toLocaleString()}/${MAX_REVIEW_COMMENT_LENGTH.toLocaleString()} · se renderiza como Markdown`
								: "Opcional · párrafos y Markdown (negritas, listas, enlaces, código…). Hasta 20.000 caracteres."
						}
						size="small"
					/>

					{mutation.isSuccess && (
						<Alert severity="success" sx={{ py: 0 }}>
							¡Tu opinión ha sido publicada!
						</Alert>
					)}
					{mutation.isError && (
						<Alert severity="error" sx={{ py: 0 }}>
							Error al publicar. Intenta de nuevo.
						</Alert>
					)}
				</Stack>
			</DialogContent>
			<DialogActions sx={{ px: 3, pb: 2, pt: 0 }}>
				<Button onClick={onClose} size="small">
					Cancelar
				</Button>
				<Button
					variant="contained"
					endIcon={<SendIcon />}
					onClick={handleSubmit}
					disabled={!canSubmit || mutation.isPending}
					size="small"
				>
					{mutation.isPending
						? "Publicando..."
						: `${initialReview ? "Guardar cambios" : "Publicar"}${filledCount < 5 ? ` (${filledCount}/5)` : ""}`}
				</Button>
			</DialogActions>
		</Dialog>
	);
}
