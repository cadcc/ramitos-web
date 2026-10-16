// @vitest-environment jsdom
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import FilterBar from "./FilterBar";

afterEach(() => {
	cleanup();
	vi.useRealTimers();
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
