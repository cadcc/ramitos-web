// @vitest-environment jsdom
import {
	act,
	cleanup,
	fireEvent,
	render,
	waitFor,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { useState } from "react";
import type { CourseRatings } from "../../../shared/types/domain";
import { toggleReviewTag } from "../../../constants/reviewTags";
import { reviewAxes } from "../model/reviewForm.model";
import { ReviewRatingAxisField } from "./ReviewRatingAxisField";

function RatingFields() {
	const [ratings, setRatings] = useState<Partial<CourseRatings>>({});
	const [tags, setTags] = useState<string[]>([]);
	return (
		<>
			{reviewAxes.map((axis) => (
				<ReviewRatingAxisField
					key={axis.key}
					axis={axis}
					selected={ratings[axis.key]}
					selectedTags={tags}
					onRatingChange={(key, value) =>
						setRatings((previous) => ({ ...previous, [key]: value }))
					}
					onToggleTag={(tag) =>
						setTags((previous) => toggleReviewTag(previous, tag))
					}
				/>
			))}
			<button
				onClick={() => {
					setRatings({});
					setTags([]);
				}}
			>
				Reiniciar
			</button>
		</>
	);
}

afterEach(() => {
	cleanup();
	vi.useRealTimers();
});

it("reveals the real tags after rating, preserves exclusivity and clears selections on reset", async () => {
	const view = render(<RatingFields />);
	expect(view.queryByRole("button", { name: "Plazos flexibles" })).toBeNull();
	expect(view.queryByRole("button", { name: /Borrar/ })).toBeNull();
	for (const label of [
		"← Más fácil",
		"Más difícil →",
		"← Peor docencia",
		"Mejor docencia →",
		"← Menos útil",
		"Más útil →",
	])
		expect(view.getByText(label)).toBeTruthy();
	fireEvent.keyDown(view.getByRole("slider", { name: "Carga" }), {
		key: "End",
	});
	const variable = await view.findByRole("button", {
		name: "Plazos flexibles",
	});
	fireEvent.click(variable);
	expect(variable.getAttribute("aria-pressed")).toBe("true");
	const consistent = view.getByRole("button", { name: "Plazos rígidos" });
	fireEvent.click(consistent);
	expect(variable.getAttribute("aria-pressed")).toBe("false");
	expect(consistent.getAttribute("aria-pressed")).toBe("true");
	fireEvent.click(view.getByRole("button", { name: "Reiniciar" }));
	await waitFor(() =>
		expect(view.queryByRole("button", { name: "Plazos rígidos" })).toBeNull(),
	);
	fireEvent.keyDown(view.getByRole("slider", { name: "Carga" }), {
		key: "Home",
	});
	expect(
		(await view.findByRole("button", { name: "Plazos rígidos" })).getAttribute(
			"aria-pressed",
		),
	).toBe("false");
});

it("ignores vertical touch scrolling while preserving taps, horizontal drags, and cancellation", () => {
	const view = render(<RatingFields />);
	const slider = view.getByRole("slider", { name: "Carga" });
	slider.setPointerCapture = () => {};
	slider.releasePointerCapture = () => {};
	slider.getBoundingClientRect = () => ({ left: 0, width: 244 }) as DOMRect;
	const send = (type: string, x: number, y: number) => {
		const event = new MouseEvent(type, {
			bubbles: true,
			clientX: x,
			clientY: y,
			button: 0,
		});
		Object.defineProperties(event, {
			pointerId: { value: 1 },
			isPrimary: { value: true },
			pointerType: { value: "touch" },
		});
		fireEvent(slider, event);
	};
	const unanswered = () =>
		expect(slider.getAttribute("aria-valuetext")).toBe("Sin responder");
	send("pointerdown", 122, 100);
	unanswered();
	send("pointermove", 125, 130);
	send("pointermove", 200, 135);
	send("pointerup", 200, 135);
	unanswered();
	send("pointerdown", 122, 100);
	send("pointercancel", 122, 100);
	send("pointerup", 122, 100);
	unanswered();
	send("pointerdown", 122, 100);
	send("pointermove", 125, 103);
	unanswered();
	send("pointerup", 125, 103);
	expect(slider.getAttribute("aria-valuenow")).toBe("3");
	send("pointerdown", 122, 100);
	send("pointermove", 125, 140);
	send("pointerup", 244, 145);
	expect(slider.getAttribute("aria-valuenow")).toBe("3");
	send("pointerdown", 122, 100);
	send("pointermove", 244, 103);
	expect(slider.getAttribute("aria-valuenow")).toBe("5");
	send("pointerup", 244, 103);
});

it("vibrates once per touch tick and keeps selecting when vibration is blocked or unavailable", () => {
	const original = Object.getOwnPropertyDescriptor(navigator, "vibrate");
	const vibrate = vi.fn(() => true);
	Object.defineProperty(navigator, "vibrate", {
		configurable: true,
		value: vibrate,
	});
	try {
		const view = render(<RatingFields />);
		const slider = view.getByRole("slider", { name: "Carga" });
		slider.setPointerCapture = () => {};
		slider.releasePointerCapture = () => {};
		slider.getBoundingClientRect = () => ({ left: 0, width: 244 }) as DOMRect;
		const send = (type: string, x: number, pointerType = "touch") => {
			const event = new MouseEvent(type, {
				bubbles: true,
				clientX: x,
				button: 0,
			});
			Object.defineProperties(event, {
				pointerId: { value: 1 },
				isPrimary: { value: true },
				pointerType: { value: pointerType },
			});
			fireEvent(slider, event);
		};
		send("pointermove", 122);
		expect(vibrate).not.toHaveBeenCalled();
		send("pointerdown", 122);
		expect(vibrate).not.toHaveBeenCalled();
		send("pointerup", 122);
		expect(vibrate).toHaveBeenCalledExactlyOnceWith(10);
		send("pointerdown", 122);
		send("pointermove", 122);
		send("pointermove", 244);
		send("pointerup", 244);
		expect(vibrate).toHaveBeenCalledTimes(2);
		send("pointerdown", 244);
		send("pointerup", 244);
		expect(vibrate).toHaveBeenCalledTimes(2);
		vibrate.mockImplementationOnce(() => {
			throw new Error("Blocked");
		});
		send("pointerdown", 0);
		send("pointerup", 0);
		expect(slider.getAttribute("aria-valuenow")).toBe("1");
		send("pointerdown", 122, "mouse");
		send("pointerup", 122, "mouse");
		fireEvent.keyDown(slider, { key: "End" });
		expect(vibrate).toHaveBeenCalledTimes(3);
		Reflect.deleteProperty(navigator, "vibrate");
		send("pointerdown", 122);
		send("pointerup", 122);
		expect(slider.getAttribute("aria-valuenow")).toBe("3");
	} finally {
		if (original) Object.defineProperty(navigator, "vibrate", original);
		else Reflect.deleteProperty(navigator, "vibrate");
	}
});

it("uses direction labels, previews an emoji without selecting, and replays bubbles only on new ratings", () => {
	const view = render(<RatingFields />);
	const slider = view.getByRole("slider", { name: "Carga" });
	expect(view.getByText("← Menos carga")).toBeTruthy();
	expect(view.getByText("Más carga →")).toBeTruthy();
	fireEvent.focus(slider);
	expect(slider.getAttribute("aria-valuetext")).toBe("Sin responder");
	expect(slider.querySelector(".empty-track-cue")).toBeTruthy();
	expect(slider.querySelector(".empty-track-cue")?.textContent).toBe("😅");
	fireEvent.keyDown(slider, { key: "End" });
	expect(slider.querySelector(".empty-track-cue")).toBeNull();
	const bubble = document.querySelector(".level-bubble");
	expect(bubble?.textContent).toBe("Brutal");
	expect(slider.getAttribute("aria-valuetext")).toBe("5 de 5: Brutal");
	fireEvent.keyDown(slider, { key: "End" });
	expect(document.querySelector(".level-bubble")).toBe(bubble);
	fireEvent.keyDown(slider, { key: "ArrowLeft" });
	expect(document.querySelector(".level-bubble")).not.toBe(bubble);
	expect(document.querySelector(".level-bubble")?.textContent).toBe("Pesado");
});

it("animates the first selection from zero, reverses without jumping, and settles exactly", () => {
	vi.useFakeTimers();
	const view = render(<RatingFields />);
	const slider = view.getByRole("slider", { name: "Carga" });
	const track = slider.firstElementChild as HTMLElement;
	const position = () =>
		parseFloat(track.style.getPropertyValue("--slider-position"));
	fireEvent.keyDown(slider, { key: "End" });
	expect(position()).toBe(0);
	act(() => {
		vi.advanceTimersByTime(100);
	});
	expect(position()).toBeGreaterThan(0);
	expect(position()).toBeLessThan(100);
	const beforeReversing = position();
	fireEvent.keyDown(slider, { key: "Home" });
	expect(position()).toBe(beforeReversing);
	act(() => {
		vi.advanceTimersByTime(1500);
	});
	expect(position()).toBe(0);
	fireEvent.keyDown(slider, { key: "End" });
	act(() => {
		vi.advanceTimersByTime(1500);
	});
	expect(position()).toBe(100);
	fireEvent.click(view.getByRole("button", { name: "Reiniciar" }));
	fireEvent.keyDown(slider, { key: "Home" });
	expect(position()).toBe(0);
	act(() => {
		vi.advanceTimersByTime(500);
	});
	expect(position()).toBe(0);
});

it("starts unanswered, selects with the keyboard, respects bounds and clears responses", () => {
	const view = render(<RatingFields />);
	const slider = view.getByRole("slider", { name: "Carga" });
	expect(slider.getAttribute("aria-valuetext")).toBe("Sin responder");
	expect(slider.querySelector(".emoji-handle")).toBeNull();
	fireEvent.keyDown(slider, { key: "ArrowRight" });
	expect(slider.getAttribute("aria-valuenow")).toBe("3");
	expect(slider.querySelector(".emoji-handle")?.textContent).toBe("😅");
	fireEvent.keyDown(slider, { key: "End" });
	fireEvent.keyDown(slider, { key: "ArrowRight" });
	expect(slider.getAttribute("aria-valuenow")).toBe("5");
	fireEvent.click(view.getByRole("button", { name: "Reiniciar" }));
	expect(
		view.getByRole("slider", { name: "Carga" }).getAttribute("aria-valuetext"),
	).toBe("Sin responder");
	fireEvent.keyDown(view.getByRole("slider", { name: "Docencia" }), {
		key: "Home",
	});
	fireEvent.click(view.getByRole("button", { name: "Reiniciar" }));
	expect(
		view
			.getAllByRole("slider")
			.every((item) => item.getAttribute("aria-valuetext") === "Sin responder"),
	).toBe(true);
});

it("selects the initial midpoint and drags to both ends, ignoring unrelated pointers", () => {
	// jsdom has no PointerEvent implementation or pointer capture.
	const original = window.PointerEvent;
	window.PointerEvent = MouseEvent as typeof PointerEvent;
	try {
		const view = render(<RatingFields />);
		const slider = view.getByRole("slider", { name: "Carga" });
		slider.setPointerCapture = () => {};
		slider.releasePointerCapture = () => {};
		slider.getBoundingClientRect = () => ({ left: 0, width: 244 }) as DOMRect;
		const pointerEvent = (type: string, x: number, pointerId = 1) => {
			const event = new MouseEvent(type, {
				bubbles: true,
				clientX: x,
				button: 0,
			});
			Object.defineProperties(event, {
				pointerId: { value: pointerId },
				isPrimary: { value: true },
			});
			fireEvent(slider, event);
		};
		const track = slider.firstElementChild as HTMLElement;
		pointerEvent("pointermove", 0);
		expect(track.style.getPropertyValue("--hover-position")).toBe("0%");
		expect(slider.querySelector(".empty-track-cue")?.textContent).toBe("🎁");
		pointerEvent("pointermove", 244);
		expect(track.style.getPropertyValue("--hover-position")).toBe("100%");
		expect(slider.querySelector(".empty-track-cue")?.textContent).toBe("🥵");
		pointerEvent("pointermove", 122);
		expect(track.style.getPropertyValue("--hover-position")).toBe("50%");
		expect(slider.querySelector(".empty-track-cue")?.textContent).toBe("😅");
		expect(slider.getAttribute("aria-valuetext")).toBe("Sin responder");
		pointerEvent("pointerdown", 122);
		expect(slider.getAttribute("aria-valuenow")).toBe("3");
		pointerEvent("pointermove", 244, 2);
		expect(slider.getAttribute("aria-valuenow")).toBe("3");
		pointerEvent("pointermove", 244);
		expect(slider.getAttribute("aria-valuenow")).toBe("5");
		pointerEvent("pointerup", 0);
		expect(slider.getAttribute("aria-valuenow")).toBe("1");
		pointerEvent("pointermove", 244);
		expect(slider.getAttribute("aria-valuenow")).toBe("1");
	} finally {
		window.PointerEvent = original;
	}
});
