// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
	getPreviewCourseFilters,
	PREVIEW_FEATURES_KEY,
	setPreviewFeature,
	usePreviewFeatures,
} from "./usePreviewFeatures";

beforeEach(() => {
	localStorage.clear();
	window.dispatchEvent(
		new StorageEvent("storage", { key: PREVIEW_FEATURES_KEY }),
	);
});
afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
	setPreviewFeature("courseSummaries", false);
	localStorage.clear();
});

it("defaults off, updates all consumers immediately, and persists across remounts", () => {
	const first = renderHook(usePreviewFeatures);
	const second = renderHook(usePreviewFeatures);
	expect(first.result.current.features).toEqual({
		courseSummaries: false,
		categories: false,
		acmCategories: false,
		placeholderCourses: false,
	});
	act(() => first.result.current.setFeature("categories", true));
	expect(second.result.current.features.categories).toBe(true);
	expect(second.result.current.features.acmCategories).toBe(false);
	first.unmount();
	const remounted = renderHook(usePreviewFeatures);
	expect(remounted.result.current.features.categories).toBe(true);
	expect(JSON.parse(localStorage.getItem(PREVIEW_FEATURES_KEY)!)).toEqual(
		remounted.result.current.features,
	);
});

it.each(["broken", "null", "[]", '{"categories":"true","acmCategories":1}'])(
	"defaults off for malformed saved preferences: %s",
	(raw) => {
		localStorage.setItem(PREVIEW_FEATURES_KEY, raw);
		const view = renderHook(usePreviewFeatures);
		expect(Object.values(view.result.current.features)).toEqual([
			false,
			false,
			false,
			false,
		]);
	},
);

it("updates from another tab and from cleared storage", () => {
	const view = renderHook(usePreviewFeatures);
	act(() => {
		localStorage.setItem(
			PREVIEW_FEATURES_KEY,
			JSON.stringify({ acmCategories: true }),
		);
		window.dispatchEvent(
			new StorageEvent("storage", { key: PREVIEW_FEATURES_KEY }),
		);
	});
	expect(view.result.current.features.acmCategories).toBe(true);
	act(() => {
		localStorage.clear();
		window.dispatchEvent(new StorageEvent("storage", { key: null }));
	});
	expect(view.result.current.features.acmCategories).toBe(false);
});

it("keeps toggles working in memory when storage cannot be written", () => {
	const view = renderHook(usePreviewFeatures);
	vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
		throw new Error("Storage blocked");
	});
	act(() => setPreviewFeature("courseSummaries", true));
	expect(view.result.current.features.courseSummaries).toBe(true);
	act(() => setPreviewFeature("courseSummaries", false));
	expect(view.result.current.features.courseSummaries).toBe(false);
});

it("ignores disabled preview URL filters while preserving normal filters", () => {
	const filters = {
		q: "datos",
		category: "required" as const,
		tags: ["Machine Learning"],
		acmArea: "IA",
	};
	expect(
		getPreviewCourseFilters(filters, {
			courseSummaries: false,
			categories: false,
			acmCategories: false,
			placeholderCourses: false,
		}),
	).toEqual({ ...filters, tags: undefined, acmArea: undefined });
	expect(
		getPreviewCourseFilters(filters, {
			courseSummaries: false,
			categories: true,
			acmCategories: true,
			placeholderCourses: false,
		}),
	).toEqual(filters);
});

it("keeps placeholder courses off for existing saved preferences and persists opting in", () => {
	localStorage.setItem(
		PREVIEW_FEATURES_KEY,
		JSON.stringify({
			categories: true,
			acmCategories: true,
			courseSummaries: true,
		}),
	);
	const view = renderHook(usePreviewFeatures);
	expect(view.result.current.features.placeholderCourses).toBe(false);
	act(() => view.result.current.setFeature("placeholderCourses", true));
	view.unmount();
	const remounted = renderHook(usePreviewFeatures);
	expect(remounted.result.current.features).toEqual({
		categories: true,
		acmCategories: true,
		courseSummaries: true,
		placeholderCourses: true,
	});
});
