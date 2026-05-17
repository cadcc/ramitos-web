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
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Send as SendIcon } from "@mui/icons-material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
	CourseRatings,
	Review,
	ReviewSubmission,
} from "../../../shared/types/domain";
import { submitCourseReview } from "../api/reviewSubmission.api";
import { AXIS_TAGS, MODALITY_TAGS } from "../../../constants/courseDisplay";
import { MAX_REVIEW_COMMENT_LENGTH } from "../../../constants/reviews";
import { ReviewRatingAxisField } from "./ReviewRatingAxisField";
import { reviewAxes } from "../model/reviewForm.model";
interface Props {
	cursoId: string;
	open: boolean;
	onClose: () => void;
	initialReview?: Review | null;
}

function ReviewFormBase({ cursoId, open, onClose, initialReview }: Props) {
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
			// TODO(backend): Once term metadata is supported, switch this form to the generated review mutation hook.
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
					{reviewAxes.map((axis) => (
						<ReviewRatingAxisField
							key={axis.key}
							axis={axis}
							selected={ratings[axis.key]}
							selectedTags={selectedTags}
							onRatingChange={(key, value) =>
								setRatings((prev) => ({ ...prev, [key]: value }))
							}
							onToggleTag={toggleTag}
						/>
					))}
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

export function CreateReviewForm({
	cursoId,
	open,
	onClose,
}: Omit<Props, "initialReview">) {
	return <ReviewFormBase cursoId={cursoId} open={open} onClose={onClose} />;
}

export function EditReviewForm({
	cursoId,
	open,
	onClose,
	initialReview,
}: Props & { initialReview: Review }) {
	return (
		<ReviewFormBase
			cursoId={cursoId}
			open={open}
			onClose={onClose}
			initialReview={initialReview}
		/>
	);
}

export default ReviewFormBase;
