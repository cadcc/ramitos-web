import { celebrateReviewPublication } from "./reviewConfetti";
import { ReviewExtraTagSection } from "./ReviewExtraTagSection";
import { TAG_SUGGESTION_URL } from "../../../constants/issueLinks";
import { useAuth } from "../../auth";
import { reviewDraftKey, useReviewDraft } from "../hooks/useReviewDraft";
import {
	LinearProgress,
	Button,
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
import {
	REVIEW_TAG_SECTIONS,
	toggleReviewTag,
} from "../../../constants/reviewTags";
import { ReviewCommentField } from "./ReviewCommentField";
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
			await Promise.all([
				qc.invalidateQueries({ queryKey: ["reviews", cursoId] }),
				qc.invalidateQueries({ queryKey: ["ownReview", cursoId] }),
				qc.invalidateQueries({ queryKey: ["course", cursoId] }),
				qc.invalidateQueries({ queryKey: ["course-catalog"] }),
				qc.invalidateQueries({ queryKey: ["course-catalog-page"] }),
				qc.invalidateQueries({ queryKey: ["reviewable-courses"] }),
			]);
			celebrateReviewPublication();
			clearDraft();
			onClose();
		},
	});

	const filledCount = reviewAxes.filter(
		(axis) => ratings[axis.key] !== undefined,
	).length;
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

	const toggleTag = (tag: string) =>
		updateDraft({ selectedTags: toggleReviewTag(selectedTags, tag) });
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
			<LinearProgress
				variant="determinate"
				value={filledCount * 20}
				aria-label="Progreso de la opinión"
				color={filledCount === 5 ? "success" : "primary"}
				sx={{
					height: 3,
					flexShrink: 0,
					borderRadius: 0,
					"@media (prefers-reduced-motion: reduce)": {
						"& .MuiLinearProgress-bar": { transition: "none" },
					},
				}}
			/>
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
				Comparte tu experiencia
			</DialogTitle>
			<DialogContent sx={{ px: { xs: 2, sm: 3 }, pt: 1.5 }}>
				<Stack spacing={3} useFlexGap sx={{ mt: 0.5 }}>
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
					{REVIEW_TAG_SECTIONS.filter((section) => !section.axis).map(
						(section) => (
							<ReviewExtraTagSection
								key={section.key}
								section={section}
								allAxesRated={filledCount === 5}
								selectedTags={selectedTags}
								onToggleTag={toggleTag}
							/>
						),
					)}

					<ReviewCommentField
						value={comment}
						onChange={(comment) => updateDraft({ comment })}
						open={open}
						isMobile={isMobile}
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
					component="a"
					href={TAG_SUGGESTION_URL}
					target="_blank"
					rel="noopener noreferrer"
					size="small"
					sx={{ fontSize: "0.75rem", textTransform: "none", px: 0.5 }}
				>
					Sugerir una etiqueta
				</Button>
				<Button
					variant="contained"
					endIcon={<SendIcon />}
					onClick={handleSubmit}
					disabled={!canSubmit || mutation.isPending}
					size="small"
					sx={{
						transition: "background-color 240ms ease, box-shadow 240ms ease",
						"@media (prefers-reduced-motion: reduce)": { transition: "none" },
					}}
				>
					{mutation.isPending
						? "Publicando..."
						: initialReview
							? "Guardar cambios"
							: filledCount === 5
								? "Publicar opinión"
								: `Publicar (${filledCount}/5)`}
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
