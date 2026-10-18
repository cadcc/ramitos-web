// @vitest-environment jsdom
import {
	cleanup,
	fireEvent,
	render,
	waitFor,
	within,
} from "@testing-library/react";
import {
	QueryClient,
	QueryClientProvider,
	QueryObserver,
} from "@tanstack/react-query";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { CreateReviewForm } from "./ReviewForm";
import { submitCourseReview } from "../api/reviewSubmission.api";
import { reviewDraftKey } from "../hooks/useReviewDraft";
import { celebrateReviewPublication } from "./reviewConfetti";
vi.mock("./reviewConfetti", () => ({ celebrateReviewPublication: vi.fn() }));
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
	vi.mocked(celebrateReviewPublication).mockClear();
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
	return { ...view, onClose, form, client };
}
it("refetches active reviews and course data before completing publication", async () => {
	window.localStorage.setItem(key, JSON.stringify(draft));
	vi.mocked(submitCourseReview).mockResolvedValue({
		id: 44,
		account_id: 7,
		course_code: "CC1000",
		stats: draft.ratings,
		tags: [],
		created_at: "2026-10-16T03:00:00Z",
	});
	const view = setup();
	const queryKeys = [
		["reviews", "CC1000", "newest"],
		["ownReview", "CC1000", 7],
		["course", "CC1000", 7],
		["course-catalog", null, {}],
		["course-catalog-page", null, "CC1000", 0],
		["reviewable-courses", 7, true],
	];
	const queries = queryKeys.map((queryKey) => {
		view.client.setQueryData(queryKey, "before publication");
		const queryFn = vi.fn().mockResolvedValue("after publication");
		const observer = new QueryObserver(view.client, {
			queryKey,
			queryFn,
			staleTime: Infinity,
		});
		return {
			queryKey,
			queryFn,
			unsubscribe: observer.subscribe(() => undefined),
		};
	});
	try {
		fireEvent.click(view.getByRole("button", { name: "Publicar opinión" }));
		await waitFor(() => expect(view.onClose).toHaveBeenCalledOnce());
		for (const query of queries) {
			expect(query.queryFn).toHaveBeenCalledOnce();
			expect(view.client.getQueryData(query.queryKey)).toBe(
				"after publication",
			);
		}
	} finally {
		queries.forEach((query) => query.unsubscribe());
	}
});
it("tracks five ratings and automatically opens the individual extra sections", () => {
	const view = setup();
	expect(view.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("0");
	expect(
		view
			.getByRole("button", { name: "Modalidad" })
			.getAttribute("aria-expanded"),
	).toBe("false");
	for (const [index, label] of [
		"Carga",
		"Dificultad",
		"Docencia",
		"Utilidad",
		"Ambiente",
	].entries()) {
		fireEvent.keyDown(view.getByRole("slider", { name: label }), {
			key: "Enter",
		});
		expect(view.getByRole("progressbar").getAttribute("aria-valuenow")).toBe(
			String((index + 1) * 20),
		);
	}
	expect(
		(
			view.getByRole("button", {
				name: "Publicar opinión",
			}) as HTMLButtonElement
		).disabled,
	).toBe(false);
	expect(view.getByRole("progressbar").getAttribute("aria-valuenow")).toBe(
		"100",
	);
	expect(
		view
			.getByRole("button", { name: "Modalidad" })
			.getAttribute("aria-expanded"),
	).toBe("true");
});
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
	fireEvent.click(view.getByRole("button", { name: "Publicar opinión" }));
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
	expect(celebrateReviewPublication).toHaveBeenCalledTimes(1);
});
it("keeps the saved draft after a failed publication", async () => {
	window.localStorage.setItem(key, JSON.stringify(draft));
	vi.mocked(submitCourseReview).mockRejectedValue(new Error("offline"));
	const view = setup();
	fireEvent.click(view.getByRole("button", { name: "Publicar opinión" }));
	await view.findByText("Error al publicar. Intenta de nuevo.");
	expect(JSON.parse(window.localStorage.getItem(key)!)).toEqual(draft);
	expect(view.onClose).not.toHaveBeenCalled();
	expect(celebrateReviewPublication).not.toHaveBeenCalled();
});

it("restores slider positions quietly, persists new ratings and tags, and submits them", async () => {
	window.localStorage.setItem(key, JSON.stringify(draft));
	vi.mocked(submitCourseReview).mockResolvedValue({
		id: 44,
		account_id: 7,
		course_code: "CC1000",
		stats: draft.ratings,
		tags: [],
		created_at: "2026-10-18T12:00:00Z",
	});
	const view = setup();
	const slider = view.getByRole("slider", { name: "Carga" });
	expect(view.getAllByRole("slider")).toHaveLength(5);
	expect(slider.getAttribute("aria-valuenow")).toBe("1");
	expect(
		(
			view.getByRole("slider", { name: "Ambiente" })
				.firstElementChild as HTMLElement
		).style.getPropertyValue("--slider-position"),
	).toBe("100%");
	expect(document.querySelector(".level-bubble")).toBeNull();
	fireEvent.keyDown(slider, { key: "End" });
	fireEvent.click(view.getByRole("button", { name: "Plazos flexibles" }));
	expect(JSON.parse(window.localStorage.getItem(key)!)).toMatchObject({
		ratings: { carga: 5 },
		selectedTags: ["flexible_deadlines"],
	});
	fireEvent.click(view.getByRole("button", { name: "Publicar opinión" }));
	await waitFor(() =>
		expect(submitCourseReview).toHaveBeenCalledWith(
			expect.objectContaining({
				ratings: { ...draft.ratings, carga: 5 },
				tags: ["flexible_deadlines"],
			}),
			expect.anything(),
		),
	);
});

it("selects category options independently, restores them, and submits their context", async () => {
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
	fireEvent.click(view.getByRole("button", { name: "Industria" }));
	fireEvent.click(view.getByRole("button", { name: "Academia" }));
	expect(
		view
			.getByRole("button", { name: "Industria" })
			.getAttribute("aria-pressed"),
	).toBe("true");
	expect(
		view.getByRole("button", { name: "Academia" }).getAttribute("aria-pressed"),
	).toBe("true");
	fireEvent.click(view.getByRole("button", { name: "Industria" }));
	expect(
		view.getByRole("button", { name: "Academia" }).getAttribute("aria-pressed"),
	).toBe("true");
	view.unmount();
	const restored = setup();
	expect(
		restored
			.getByRole("button", { name: "Industria" })
			.getAttribute("aria-pressed"),
	).toBe("false");
	expect(
		restored
			.getByRole("button", { name: "Academia" })
			.getAttribute("aria-pressed"),
	).toBe("true");
	fireEvent.click(restored.getByRole("button", { name: "La vida" }));
	fireEvent.click(restored.getByRole("button", { name: "Publicar opinión" }));
	await waitFor(() => expect(restored.onClose).toHaveBeenCalled());
	expect(submitCourseReview).toHaveBeenCalledWith(
		expect.objectContaining({
			tags: ["useful_research", "useful_daily_life"],
		}),
		expect.anything(),
	);
});

it("uses configured exclusive groups while preserving independent tags", () => {
	const view = setup();
	fireEvent.click(view.getByRole("button", { name: "Modalidad" }));
	fireEvent.click(view.getByRole("button", { name: "Online" }));
	fireEvent.click(view.getByRole("button", { name: "Grupal" }));
	fireEvent.click(view.getByRole("button", { name: "Presencial" }));
	expect(
		view.getByRole("button", { name: "Online" }).getAttribute("aria-pressed"),
	).toBe("false");
	expect(
		view
			.getByRole("button", { name: "Presencial" })
			.getAttribute("aria-pressed"),
	).toBe("true");
	expect(
		view.getByRole("button", { name: "Grupal" }).getAttribute("aria-pressed"),
	).toBe("true");
	expect(JSON.parse(window.localStorage.getItem(key)!)).toMatchObject({
		selectedTags: ["heavy_group_work", "in_person"],
	});
});

it("renders a mixed content group and preserves its independent selection", () => {
	window.localStorage.setItem(key, JSON.stringify(draft));
	const view = setup();
	const content = within(view.getByRole("group", { name: "Contenido" }));
	fireEvent.click(content.getByRole("button", { name: "Relleno" }));
	fireEvent.click(content.getByRole("button", { name: "Estado del arte" }));
	fireEvent.click(content.getByRole("button", { name: "Desactualizado" }));
	expect(
		content
			.getByRole("button", { name: "Relleno" })
			.getAttribute("aria-pressed"),
	).toBe("true");
	expect(
		content
			.getByRole("button", { name: "Estado del arte" })
			.getAttribute("aria-pressed"),
	).toBe("false");
	expect(JSON.parse(window.localStorage.getItem(key)!)).toMatchObject({
		selectedTags: ["filler", "outdated"],
	});
});
