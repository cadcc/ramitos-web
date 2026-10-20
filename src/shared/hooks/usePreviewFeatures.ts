import { useMemo, useSyncExternalStore } from "react";
import type { CourseFilters } from "../types/domain";

export const PREVIEW_FEATURES_KEY = "ramitos-preview-features-v1";
const changeEvent = "ramitos-preview-features-change";
const featureBits = {
	courseSummaries: 1,
	categories: 2,
	acmCategories: 4,
	placeholderCourses: 8,
} as const;
export type PreviewFeature = keyof typeof featureBits;
export type PreviewFeatures = Record<PreviewFeature, boolean>;
let memorySnapshot: number | undefined;

function getSnapshot(): number {
	if (memorySnapshot !== undefined) return memorySnapshot;
	let raw: string | null;
	try {
		raw = window.localStorage.getItem(PREVIEW_FEATURES_KEY);
	} catch {
		return 0;
	}
	try {
		const saved: unknown = JSON.parse(raw ?? "null");
		if (!saved || typeof saved !== "object" || Array.isArray(saved)) return 0;
		return Object.entries(featureBits).reduce(
			(bits, [key, bit]) =>
				bits | ((saved as Record<string, unknown>)[key] === true ? bit : 0),
			0,
		);
	} catch {
		return 0;
	}
}

function toFeatures(snapshot: number): PreviewFeatures {
	return {
		courseSummaries: Boolean(snapshot & featureBits.courseSummaries),
		categories: Boolean(snapshot & featureBits.categories),
		acmCategories: Boolean(snapshot & featureBits.acmCategories),
		placeholderCourses: Boolean(snapshot & featureBits.placeholderCourses),
	};
}

function subscribe(callback: () => void) {
	const onStorage = (event: StorageEvent) => {
		if (event.key === PREVIEW_FEATURES_KEY || event.key === null) {
			memorySnapshot = undefined;
			callback();
		}
	};
	window.addEventListener(changeEvent, callback);
	window.addEventListener("storage", onStorage);
	return () => {
		window.removeEventListener(changeEvent, callback);
		window.removeEventListener("storage", onStorage);
	};
}

export function setPreviewFeature(feature: PreviewFeature, enabled: boolean) {
	const next = { ...toFeatures(getSnapshot()), [feature]: enabled };
	try {
		window.localStorage.setItem(PREVIEW_FEATURES_KEY, JSON.stringify(next));
		memorySnapshot = undefined;
	} catch {
		memorySnapshot = Object.entries(featureBits).reduce(
			(bits, [key, bit]) => bits | (next[key as PreviewFeature] ? bit : 0),
			0,
		);
	}
	window.dispatchEvent(new Event(changeEvent));
}

export function usePreviewFeatures() {
	const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => 0);
	const features = useMemo(() => toFeatures(snapshot), [snapshot]);
	return { features, setFeature: setPreviewFeature };
}

export function getPreviewCourseFilters(
	filters: CourseFilters,
	features: PreviewFeatures,
): CourseFilters {
	return {
		...filters,
		tags: features.categories ? filters.tags : undefined,
		acmArea: features.acmCategories ? filters.acmArea : undefined,
	};
}
