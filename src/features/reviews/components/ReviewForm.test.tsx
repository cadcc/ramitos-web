// @vitest-environment jsdom
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { CreateReviewForm } from "./ReviewForm";
import { submitCourseReview } from "../api/reviewSubmission.api";
import { reviewDraftKey } from "../hooks/useReviewDraft";
vi.mock("../../auth", () => ({ useAuth: () => ({ user: { id: 7 } }) }));
vi.mock("../api/reviewSubmission.api", () => ({ submitCourseReview: vi.fn() }));
const key = reviewDraftKey(7, "CC1000")!;
const draft = {
	ratings: { carga: 1, dificultad: 2, docencia: 3, relevancia: 4, vibes: 5 },
	selectedTags: [],
	comment: "Mi borrador",
};
beforeEach(() => {
	window.localStorage.clear();
	vi.mocked(submitCourseReview).mockReset();
});
afterEach(cleanup);
function setup() {
	const client = new QueryClient({
		defaultOptions: { mutations: { retry: false } },
	});
	const onClose = vi.fn();
	const form = (open: boolean) => (
		<QueryClientProvider client={client}>
			<CreateReviewForm cursoId="CC1000" open={open} onClose={onClose} />
		</QueryClientProvider>
	);
	const view = render(form(true));
	return { ...view, onClose, form };
}
it("retains typed text after closing and reopening the dialog", () => {
	const view = setup();
	fireEvent.change(view.getByLabelText("Comentario (opcional)"), {
		target: { value: "No perder este texto" },
	});
	fireEvent.click(view.getByRole("button", { name: "Cerrar" }));
	expect(view.onClose).toHaveBeenCalled();
	view.rerender(view.form(false));
	view.rerender(view.form(true));
	expect(
		(view.getByLabelText("Comentario (opcional)") as HTMLTextAreaElement).value,
	).toBe("No perder este texto");
	view.unmount();
	const remounted = setup();
	expect(
		(remounted.getByLabelText("Comentario (opcional)") as HTMLTextAreaElement)
			.value,
	).toBe("No perder este texto");
});
it("publishes restored selections and clears the saved draft only after success", async () => {
	window.localStorage.setItem(key, JSON.stringify(draft));
	vi.mocked(submitCourseReview).mockResolvedValue({
		id: 44,
		account_id: 7,
		course_code: "CC1000",
		stats: draft.ratings,
		tags: [],
		created_at: "2026-10-12T12:00:00Z",
	});
	const view = setup();
	fireEvent.click(view.getByRole("button", { name: "Publicar" }));
	await waitFor(() => expect(view.onClose).toHaveBeenCalled());
	expect(submitCourseReview).toHaveBeenCalledWith(
		expect.objectContaining({
			ratings: draft.ratings,
			comment: draft.comment,
			tags: draft.selectedTags,
		}),
		expect.anything(),
	);
	expect(window.localStorage.getItem(key)).toBeNull();
});
it("keeps the saved draft after a failed publication", async () => {
	window.localStorage.setItem(key, JSON.stringify(draft));
	vi.mocked(submitCourseReview).mockRejectedValue(new Error("offline"));
	const view = setup();
	fireEvent.click(view.getByRole("button", { name: "Publicar" }));
	await view.findByText("Error al publicar. Intenta de nuevo.");
	expect(JSON.parse(window.localStorage.getItem(key)!)).toEqual(draft);
	expect(view.onClose).not.toHaveBeenCalled();
});
