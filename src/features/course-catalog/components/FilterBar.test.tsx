// @vitest-environment jsdom
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import FilterBar from "./FilterBar";
import tags from "../../../../data/courses/tags.json";

afterEach(() => {
	cleanup();
	vi.useRealTimers();
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
