// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import CourseCard from "./CourseCard";
import { toCourseCatalogItem } from "../api/courseCatalog.api";

vi.mock("./CourseCardTitle", () => ({
	CourseCardTitle: ({ title }: { title: string }) => <span>{title}</span>,
}));
afterEach(cleanup);

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
