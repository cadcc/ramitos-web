// @vitest-environment jsdom
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
	createMemoryHistory,
	createRootRoute,
	createRoute,
	createRouter,
	RouterProvider,
} from "@tanstack/react-router";
import { CourseDetailPage } from "./CourseDetailPage";
import {
	PREVIEW_FEATURES_KEY,
	setPreviewFeature,
} from "../../../shared/hooks/usePreviewFeatures";

vi.mock("../hooks/useCourseDetail", () => ({
	useCourseDetail: () => ({
		isPending: false,
		isError: false,
		data: {
			id: "CC6205",
			code: "CC6205",
			name: "Lenguaje Natural",
			description: "Resumen de prueba",
			syllabusUrl: "https://example.com/programa",
			categoryTags: ["Machine Learning"],
			acmUnits: ["IA-PLN"],
			reviewTags: [],
			reviewCount: 0,
			commentReviewCount: 0,
			ratings: {
				carga: 0,
				dificultad: 0,
				docencia: 0,
				relevancia: 0,
				vibes: 0,
			},
		},
	}),
}));
vi.mock("../../reviews", () => ({ CourseReviewsSection: () => null }));
vi.mock("./CourseRadar", () => ({ default: () => null }));

beforeEach(() => {
	localStorage.clear();
	window.dispatchEvent(
		new StorageEvent("storage", { key: PREVIEW_FEATURES_KEY }),
	);
});
afterEach(cleanup);

it("keeps previews off by default and updates each course feature independently", async () => {
	const root = createRootRoute();
	const route = createRoute({
		getParentRoute: () => root,
		path: "/curso/$cursoId",
		component: () => <CourseDetailPage cursoId="CC6205" reviewSort="newest" />,
	});
	const router = createRouter({
		routeTree: root.addChildren([route]),
		history: createMemoryHistory({ initialEntries: ["/curso/CC6205"] }),
	});
	const view = render(<RouterProvider router={router} />);
	await view.findByRole("heading", { name: "CC6205 - Lenguaje Natural" });
	expect(view.queryByText("Resumen de prueba")).toBeNull();
	expect(view.queryByRole("group", { name: "Categorías del ramo" })).toBeNull();
	expect(view.queryByRole("region", { name: "Clasificación ACM" })).toBeNull();
	expect(view.getByRole("link", { name: "Programa del curso" })).toBeDefined();
	act(() => setPreviewFeature("courseSummaries", true));
	expect(view.getByText("Resumen de prueba")).toBeDefined();
	expect(view.queryByRole("group", { name: "Categorías del ramo" })).toBeNull();
	act(() => setPreviewFeature("categories", true));
	expect(
		view.getByRole("group", { name: "Categorías del ramo" }),
	).toBeDefined();
	expect(view.queryByRole("region", { name: "Clasificación ACM" })).toBeNull();
	act(() => setPreviewFeature("acmCategories", true));
	expect(view.getByRole("region", { name: "Clasificación ACM" })).toBeDefined();
	act(() => setPreviewFeature("courseSummaries", false));
	expect(view.queryByText("Resumen de prueba")).toBeNull();
	expect(view.getByRole("region", { name: "Clasificación ACM" })).toBeDefined();
});
