// @vitest-environment jsdom
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { setPreviewFeature } from "../../../shared/hooks/usePreviewFeatures";
import FilterBar from "./FilterBar";
import tags from "../../../../data/courses/tags.json";

beforeEach(() => {
	setPreviewFeature("categories", true);
	setPreviewFeature("acmCategories", true);
});

afterEach(() => {
	cleanup();
	localStorage.clear();
	vi.useRealTimers();
});

it("hides disabled preview controls and ignores their active-filter indicator", () => {
	setPreviewFeature("categories", false);
	setPreviewFeature("acmCategories", false);
	const view = render(
		<FilterBar
			filters={{ tags: ["Machine Learning"], acmArea: "IA" }}
			onFilterChange={vi.fn()}
			categoryOptions={tags.map((tag) => tag.name)}
		/>,
	);
	expect(view.queryByRole("combobox", { name: "Categoría" })).toBeNull();
	expect(view.queryByRole("button", { name: /Taxonomía ACM/ })).toBeNull();
	expect(view.queryByText("Limpiar")).toBeNull();
	expect(view.getByRole("group", { name: "Tipo de ramo" })).toBeDefined();
});

it("preserves other filters when selecting and clearing an ACM tree node", () => {
	const onFilterChange = vi.fn();
	const filters = {
		category: "specialization" as const,
		tags: ["Machine Learning"],
		q: "redes",
	};
	const view = render(
		<FilterBar
			filters={filters}
			onFilterChange={onFilterChange}
			categoryOptions={tags.map((tag) => tag.name)}
		/>,
	);
	const select = view.getByRole("button", { name: "Taxonomía ACM: Todas" });
	fireEvent.click(select);
	fireEvent.click(
		view.getByRole("button", { name: "Expandir Desarrollo de Aplicaciones" }),
	);
	fireEvent.click(view.getByText("Inteligencia Artificial"));
	expect(onFilterChange).toHaveBeenLastCalledWith({
		...filters,
		acmArea: "IA",
	});
	view.rerender(
		<FilterBar
			filters={{ ...filters, acmArea: "IA" }}
			onFilterChange={onFilterChange}
			categoryOptions={tags.map((tag) => tag.name)}
		/>,
	);
	fireEvent.click(select);
	fireEvent.click(view.getByRole("button", { name: "Todas las áreas" }));
	expect(onFilterChange).toHaveBeenLastCalledWith({
		...filters,
		acmArea: undefined,
	});
});

it("shows every local category and preserves other filters when selecting or clearing it", () => {
	const onFilterChange = vi.fn();
	const filters = {
		q: "datos",
		category: "specialization" as const,
		reviewable: true,
	};
	const categoryOptions = tags.map((tag) => tag.name);
	const view = render(
		<FilterBar
			filters={filters}
			onFilterChange={onFilterChange}
			categoryOptions={categoryOptions}
		/>,
	);
	const select = view.getByRole("combobox", { name: "Categoría" });
	fireEvent.mouseDown(select);
	expect(view.getAllByRole("option")).toHaveLength(43);
	for (const tag of tags) {
		expect(view.getByRole("option", { name: tag.name })).toBeDefined();
	}
	fireEvent.click(view.getByRole("option", { name: "Machine Learning" }));
	expect(onFilterChange).toHaveBeenLastCalledWith({
		...filters,
		tags: ["Machine Learning"],
	});
	view.rerender(
		<FilterBar
			filters={{ ...filters, tags: ["Machine Learning"] }}
			onFilterChange={onFilterChange}
			categoryOptions={categoryOptions}
		/>,
	);
	fireEvent.mouseDown(select);
	fireEvent.click(view.getByRole("option", { name: "Todas" }));
	expect(onFilterChange).toHaveBeenLastCalledWith({
		...filters,
		tags: undefined,
	});
});

it("debounces typing and follows URL changes without restoring an old draft", () => {
	vi.useFakeTimers();
	const onFilterChange = vi.fn();
	const view = render(
		<FilterBar filters={{}} onFilterChange={onFilterChange} />,
	);
	const input = view.getByRole("textbox", { name: "Buscar curso" });
	fireEvent.change(input, { target: { value: "CC1001" } });
	expect(onFilterChange).not.toHaveBeenCalled();
	act(() => {
		vi.advanceTimersByTime(350);
	});
	expect(onFilterChange).toHaveBeenCalledWith({ q: "CC1001" });
	view.rerender(
		<FilterBar filters={{ q: "CC1001" }} onFilterChange={onFilterChange} />,
	);
	view.rerender(<FilterBar filters={{}} onFilterChange={onFilterChange} />);
	expect((input as HTMLInputElement).value).toBe("");
	act(() => {
		vi.advanceTimersByTime(350);
	});
	expect(onFilterChange).toHaveBeenCalledTimes(1);
});

it("defaults to all courses and supports both personal filters", () => {
	const onFilterChange = vi.fn();
	const view = render(
		<FilterBar filters={{}} onFilterChange={onFilterChange} />,
	);
	const select = view.getByRole("combobox", { name: "Ramos" });
	expect(select.textContent).toBe("Todos");
	fireEvent.mouseDown(select);
	fireEvent.click(view.getByRole("option", { name: "No cursados" }));
	expect(onFilterChange).toHaveBeenLastCalledWith({ reviewable: false });
	fireEvent.mouseDown(select);
	fireEvent.click(view.getByRole("option", { name: "Cursados" }));
	expect(onFilterChange).toHaveBeenLastCalledWith({ reviewable: true });
	view.rerender(
		<FilterBar
			filters={{ reviewable: true }}
			onFilterChange={onFilterChange}
		/>,
	);
	fireEvent.mouseDown(select);
	fireEvent.click(view.getByRole("option", { name: "Todos" }));
	expect(onFilterChange).toHaveBeenLastCalledWith({ reviewable: undefined });
});
