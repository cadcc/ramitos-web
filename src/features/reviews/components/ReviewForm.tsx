import { useAuth } from "../../auth";
import { reviewDraftKey, useReviewDraft } from "../hooks/useReviewDraft";
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
	useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import SendIcon from "@mui/icons-material/Send";
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

const CURRENT_YEAR = new Date().getFullYear();
const CURRENT_SEMESTER: 1 | 2 = new Date().getMonth() < 7 ? 1 : 2;

function ReviewFormBase(props: Props) {
	const { user } = useAuth();
	const draftKey = reviewDraftKey(
		user?.id,
		props.cursoId,
		props.initialReview?.id,
	);
	return (
		<ReviewFormContent
			key={draftKey ?? `${props.cursoId}:anonymous`}
			{...props}
			draftKey={draftKey}
		/>
	);
}

function ReviewFormContent({
	cursoId,
	open,
	onClose,
	initialReview,
	draftKey,
}: Props & { draftKey: string | null }) {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
	const qc = useQueryClient();
	const { ratings, selectedTags, comment, updateDraft, clearDraft } =
		useReviewDraft(draftKey, initialReview);
	const year = initialReview?.year ?? CURRENT_YEAR;
	const semester = initialReview?.semester ?? CURRENT_SEMESTER;

	const mutation = useMutation({
		mutationFn: submitCourseReview,
		onSuccess: async () => {
			clearDraft();
			onClose();
			await qc.invalidateQueries({ queryKey: ["reviews", cursoId] });
			await qc.invalidateQueries({ queryKey: ["ownReview", cursoId] });
			await qc.invalidateQueries({ queryKey: ["course", cursoId] });
		},
	});

	const filledCount = Object.keys(ratings).length;
	const canSubmit = filledCount === 5 && !initialReview;

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
			year,
			semester,
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
		const partner = exclusivePartner.get(tag);
		updateDraft({
			selectedTags: selectedTags.includes(tag)
				? selectedTags.filter((t) => t !== tag)
				: [...selectedTags.filter((t) => t !== partner), tag],
		});
	};

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="sm"
			fullWidth
			fullScreen={isMobile}
			slotProps={{
				paper: { sx: { maxHeight: { xs: "100%", sm: "85vh" } } },
			}}
		>
			<DialogTitle
				sx={{
					fontFamily: '"Space Grotesk", sans-serif',
					fontWeight: 700,
					px: { xs: 2, sm: 3 },
					pt: { xs: 2, sm: 2.5 },
					pb: 1,
					fontSize: { xs: "1.1rem", sm: "1.25rem" },
				}}
			>
				Comparte tu experiencia ({year}-{semester})
			</DialogTitle>
			<DialogContent sx={{ px: { xs: 2, sm: 3 }, pt: 1.5 }}>
				<Stack spacing={{ xs: 2.75, sm: 2.5 }} sx={{ mt: 0.5 }}>
					{initialReview && (
						<Alert severity="info">
							La edición de opiniones aún no está disponible.
						</Alert>
					)}
					{reviewAxes.map((axis) => (
						<ReviewRatingAxisField
							key={axis.key}
							axis={axis}
							selected={ratings[axis.key]}
							selectedTags={selectedTags}
							onRatingChange={(key, value) =>
								updateDraft({ ratings: { ...ratings, [key]: value } })
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
											width: { xs: "100%", sm: "auto" },
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
													component="button"
													type="button"
													aria-pressed={isActive}
													onClick={() => toggleTag(tag)}
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
						placeholder="¿Qué opinas del curso? ¿Cómo fue tu experiencia? Cuéntanos..."
						multiline
						minRows={isMobile ? 4 : 6}
						maxRows={24}
						value={comment}
						onChange={(e) => updateDraft({ comment: e.target.value })}
						slotProps={{ htmlInput: { maxLength: MAX_REVIEW_COMMENT_LENGTH } }}
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
			<DialogActions
				sx={{
					position: "sticky",
					bottom: 0,
					zIndex: 1,
					justifyContent: "space-between",
					gap: 1,
					px: { xs: 2, sm: 3 },
					py: { xs: 1.5, sm: 2 },
					borderTop: 1,
					borderColor: "divider",
					bgcolor: "background.paper",
				}}
			>
				<Button onClick={onClose} size="small">
					Cerrar
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
