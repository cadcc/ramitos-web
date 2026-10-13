import { useRef, useState } from "react";
import { z } from "zod";
import type { Review } from "../../../shared/types/domain";
import { MAX_REVIEW_COMMENT_LENGTH } from "../../../constants/reviews";

const rating = z.number().int().min(1).max(5).optional();
const draftSchema = z.object({
	ratings: z.object({
		carga: rating,
		dificultad: rating,
		docencia: rating,
		relevancia: rating,
		vibes: rating,
	}),
	selectedTags: z.array(z.string()),
	comment: z.string().max(MAX_REVIEW_COMMENT_LENGTH),
});
type ReviewDraft = z.infer<typeof draftSchema>;

export function reviewDraftKey(
	accountId: number | undefined,
	courseId: string,
	reviewId?: number,
) {
	return accountId === undefined
		? null
		: `ramitos:review-draft:v1:${accountId}:${encodeURIComponent(courseId)}:${reviewId ?? "new"}`;
}

function readDraft(
	key: string | null,
	initialReview?: Review | null,
): ReviewDraft {
	if (key) {
		try {
			const stored = window.localStorage.getItem(key);
			if (stored) {
				const parsed = draftSchema.safeParse(JSON.parse(stored));
				if (parsed.success) return parsed.data;
			}
		} catch {
			// Storage can be unavailable or contain an invalid draft.
		}
	}
	return {
		ratings: initialReview?.ratings ?? {},
		selectedTags: initialReview?.tags ?? [],
		comment: initialReview?.comment ?? "",
	};
}

// The form is keyed by draftKey so changing account/course never reuses another draft.
export function useReviewDraft(
	key: string | null,
	initialReview?: Review | null,
) {
	const [draft, setDraft] = useState(() => readDraft(key, initialReview));
	const current = useRef(draft);
	const updateDraft = (patch: Partial<ReviewDraft>) => {
		const next = { ...current.current, ...patch };
		current.current = next;
		setDraft(next);
		if (key) {
			try {
				window.localStorage.setItem(key, JSON.stringify(next));
			} catch {
				// Retain the in-memory draft when browser storage is unavailable.
			}
		}
	};
	const clearDraft = () => {
		const empty: ReviewDraft = { ratings: {}, selectedTags: [], comment: "" };
		current.current = empty;
		setDraft(empty);
		if (key) {
			try {
				window.localStorage.removeItem(key);
			} catch {
				/* Storage may be disabled. */
			}
		}
	};
	return { ...draft, updateDraft, clearDraft };
}
