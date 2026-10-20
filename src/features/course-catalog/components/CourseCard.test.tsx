// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { setPreviewFeature } from "../../../shared/hooks/usePreviewFeatures";
import CourseCard from "./CourseCard";
import { toCourseCatalogItem } from "../api/courseCatalog.api";
import type { ReactNode } from "react";

vi.mock("@tanstack/react-router", () => ({
	Link: ({
		children,
		params,
	}: {
		children: ReactNode;
		params: { cursoId: string };
	}) => <a href={`/curso/${params.cursoId}`}>{children}</a>,
}));

vi.mock("./CourseCardTitle", () => ({
	CourseCardTitle: ({ title }: { title: string }) => <span>{title}</span>,
}));
beforeEach(() => setPreviewFeature("acmCategories", true));
afterEach(() => {
	cleanup();
	localStorage.clear();
});

it("hides ACM pills while the preview is disabled", () => {
	setPreviewFeature("acmCategories", false);
	const course = toCourseCatalogItem({
		id: "CC6205",
		name: "Lenguaje Natural",
		categoryTags: [],
		isPlaceholder: true,
	});
	const view = render(<CourseCard course={course} index={0} acmArea="IA" />);
	expect(view.queryByRole("group", { name: "Unidades ACM" })).toBeNull();
});

it.each([false, true])(
	"shows only the selected area's assigned units (placeholder: %s)",
	(isPlaceholder) => {
		const course = toCourseCatalogItem({
			id: "CC6205",
			name: "Procesamiento de Lenguaje Natural",
			categoryTags: [],
			isPlaceholder,
		});
		const view = render(<CourseCard course={course} index={0} acmArea="IA" />);
		expect(view.getByRole("group", { name: "Unidades ACM" })).toBeDefined();
		expect(view.getByText("Aprendizaje Automático")).toBeDefined();
		expect(view.getByText("Procesamiento del Lenguaje Natural")).toBeDefined();
		expect(view.getByText("Aplicaciones e Impacto Social")).toBeDefined();
		expect(view.queryByText("Percepción y Visión por Ordenador")).toBeNull();
		if (isPlaceholder) expect(view.queryByRole("link")).toBeNull();
		else
			expect(view.getByRole("link").getAttribute("href")).toBe("/curso/CC6205");
		view.rerender(<CourseCard course={course} index={0} acmArea="GD" />);
		expect(view.queryByRole("group", { name: "Unidades ACM" })).toBeNull();
	},
);

it.each([undefined, "APLICACIONES", "IA-PLN"])(
	"omits unit pills outside a level-two selection (%s)",
	(acmArea) => {
		const course = toCourseCatalogItem({
			id: "CC6205",
			name: "Lenguaje Natural",
			categoryTags: [],
			isPlaceholder: true,
		});
		const view = render(
			<CourseCard course={course} index={0} acmArea={acmArea} />,
		);
		expect(view.queryByRole("group", { name: "Unidades ACM" })).toBeNull();
	},
);

it("renders unavailable courses without navigation, ratings, or reviewable controls", () => {
	const course = toCourseCatalogItem({
		id: "CC1002",
		name: "Introducción a la Programación",
		categoryTags: [],
		isPlaceholder: true,
	});
	const view = render(
		<CourseCard course={course} index={0} showReviewableIndicator />,
	);
	expect(view.getByText("CC1002")).toBeDefined();
	expect(view.getByText(course.name)).toBeDefined();
	expect(view.getByText("Aún no disponible")).toBeDefined();
	expect(view.container.querySelector('[aria-disabled="true"]')).not.toBeNull();
	expect(view.queryByRole("link")).toBeNull();
	expect(view.queryByLabelText("Puedes opinar")).toBeNull();
	expect(view.container.querySelector("svg")).toBeNull();
});
