// @vitest-environment jsdom
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { PreviewFeaturesDialog } from "./PreviewFeaturesDialog";
import { PREVIEW_FEATURES_KEY } from "../../hooks/usePreviewFeatures";

beforeEach(() => {
	localStorage.clear();
	window.dispatchEvent(
		new StorageEvent("storage", { key: PREVIEW_FEATURES_KEY }),
	);
});
afterEach(cleanup);

it("offers four independent switches that start off and retain choices when reopened", () => {
	const onClose = vi.fn();
	const view = render(<PreviewFeaturesDialog open onClose={onClose} />);
	const switches = view.getAllByRole("switch");
	expect(switches).toHaveLength(4);
	for (const input of switches)
		expect((input as HTMLInputElement).checked).toBe(false);
	fireEvent.click(view.getByRole("switch", { name: "Resúmenes de cursos" }));
	fireEvent.click(view.getByRole("switch", { name: "Cursos no disponibles" }));
	expect(
		(
			view.getByRole("switch", {
				name: "Resúmenes de cursos",
			}) as HTMLInputElement
		).checked,
	).toBe(true);
	expect(
		(view.getByRole("switch", { name: "Áreas" }) as HTMLInputElement)
			.checked,
	).toBe(false);
	fireEvent.click(view.getByRole("button", { name: "Listo" }));
	expect(onClose).toHaveBeenCalledOnce();
	view.unmount();
	const reopened = render(<PreviewFeaturesDialog open onClose={onClose} />);
	expect(
		(
			reopened.getByRole("switch", {
				name: "Cursos no disponibles",
			}) as HTMLInputElement
		).checked,
	).toBe(true);
	expect(
		(
			reopened.getByRole("switch", {
				name: "Resúmenes de cursos",
			}) as HTMLInputElement
		).checked,
	).toBe(true);
});
