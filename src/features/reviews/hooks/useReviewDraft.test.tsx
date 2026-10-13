// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { reviewDraftKey, useReviewDraft } from "./useReviewDraft";
const key = reviewDraftKey(1, "CC1000")!;
beforeEach(() => window.localStorage.clear());
afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
});
it("restores every field after unmounting and remounting", () => {
	const draft = {
		ratings: { carga: 3, vibes: 5 },
		selectedTags: ["Presencial"],
		comment: "Mi opinión sin terminar",
	};
	const first = renderHook(() => useReviewDraft(key));
	act(() => first.result.current.updateDraft(draft));
	first.unmount();
	const second = renderHook(() => useReviewDraft(key));
	expect(second.result.current).toMatchObject(draft);
});
it("isolates accounts, courses, and existing review edits", () => {
	window.localStorage.setItem(
		key,
		JSON.stringify({ ratings: {}, selectedTags: [], comment: "Private draft" }),
	);
	for (const otherKey of [
		reviewDraftKey(2, "CC1000"),
		reviewDraftKey(1, "CC2000"),
		reviewDraftKey(1, "CC1000", 5),
		reviewDraftKey(undefined, "CC1000"),
	]) {
		const { result, unmount } = renderHook(() => useReviewDraft(otherKey));
		expect(result.current.comment).toBe("");
		unmount();
	}
});
it.each([
	"broken JSON",
	JSON.stringify({ ratings: { carga: 99 }, selectedTags: [], comment: "bad" }),
])("ignores invalid storage: %s", (stored) => {
	window.localStorage.setItem(key, stored);
	const { result } = renderHook(() => useReviewDraft(key));
	expect(result.current.ratings).toEqual({});
	expect(result.current.comment).toBe("");
});
it("clears only the published draft", () => {
	window.localStorage.setItem("unrelated", "keep");
	const { result } = renderHook(() => useReviewDraft(key));
	act(() => result.current.updateDraft({ comment: "published" }));
	act(() => result.current.clearDraft());
	expect(window.localStorage.getItem(key)).toBeNull();
	expect(result.current.comment).toBe("");
	expect(window.localStorage.getItem("unrelated")).toBe("keep");
});
it("keeps working in memory when storage is disabled", () => {
	vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
		throw new Error("denied");
	});
	vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
		throw new Error("denied");
	});
	vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
		throw new Error("denied");
	});
	const { result } = renderHook(() => useReviewDraft(key));
	act(() => result.current.updateDraft({ comment: "Still here" }));
	expect(result.current.comment).toBe("Still here");
	act(() => result.current.clearDraft());
	expect(result.current.comment).toBe("");
});
