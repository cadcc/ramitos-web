// @vitest-environment jsdom
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { AcmTaxonomyFilter } from "./AcmTaxonomyFilter";

afterEach(cleanup);

it("expands three levels, selects a unit, and reopens its selected path", () => {
	const onChange = vi.fn();
	const view = render(<AcmTaxonomyFilter onChange={onChange} />);
	fireEvent.click(view.getByRole("button", { name: "Taxonomía ACM: Todas" }));
	expect(view.getAllByRole("treeitem")).toHaveLength(4);
	fireEvent.click(
		view.getByRole("button", { name: "Expandir Desarrollo de Aplicaciones" }),
	);
	fireEvent.click(
		view.getByRole("button", { name: "Expandir Inteligencia Artificial" }),
	);
	fireEvent.click(view.getByText("Procesamiento del Lenguaje Natural"));
	expect(onChange).toHaveBeenLastCalledWith("IA-PLN");
	view.rerender(<AcmTaxonomyFilter value="IA-PLN" onChange={onChange} />);
	fireEvent.click(
		view.getByRole("button", {
			name: "Taxonomía ACM: Procesamiento del Lenguaje Natural",
		}),
	);
	expect(
		view
			.getByRole("treeitem", { name: "Desarrollo de Aplicaciones" })
			.getAttribute("aria-expanded"),
	).toBe("true");
	expect(
		view
			.getByRole("treeitem", { name: "Inteligencia Artificial" })
			.getAttribute("aria-expanded"),
	).toBe("true");
	expect(
		view
			.getByRole("treeitem", { name: "Procesamiento del Lenguaje Natural" })
			.getAttribute("aria-selected"),
	).toBe("true");
	fireEvent.click(view.getByText("Desarrollo de Aplicaciones"));
	expect(onChange).toHaveBeenLastCalledWith("APLICACIONES");
});

it("supports keyboard expansion, navigation, selection, and Escape dismissal", async () => {
	const onChange = vi.fn();
	const view = render(<AcmTaxonomyFilter onChange={onChange} />);
	const trigger = view.getByRole("button", { name: "Taxonomía ACM: Todas" });
	trigger.focus();
	fireEvent.click(trigger);
	const group = view.getByRole("treeitem", { name: "Desarrollo de Software" });
	await waitFor(() => expect(document.activeElement).toBe(group));
	fireEvent.keyDown(group, { key: "ArrowRight" });
	fireEvent.keyDown(group, { key: "ArrowRight" });
	const area = view.getByRole("treeitem", {
		name: "Fundamentos de Desarrollo de Software",
	});
	expect(document.activeElement).toBe(area);
	fireEvent.keyDown(area, { key: "ArrowLeft" });
	expect(document.activeElement).toBe(group);
	fireEvent.keyDown(group, { key: "End" });
	const last = view.getByRole("treeitem", {
		name: "Temas Troncales Transversales",
	});
	expect(document.activeElement).toBe(last);
	fireEvent.keyDown(last, { key: "Home" });
	fireEvent.keyDown(group, { key: "Enter" });
	expect(onChange).toHaveBeenLastCalledWith("SOFTWARE");
	await waitFor(() => expect(document.activeElement).toBe(trigger));
	fireEvent.click(trigger);
	fireEvent.keyDown(
		view.getByRole("treeitem", { name: "Desarrollo de Software" }),
		{ key: "Escape" },
	);
	expect(onChange).toHaveBeenCalledTimes(1);
	await waitFor(() => expect(view.queryByRole("dialog")).toBeNull());
});
