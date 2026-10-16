// @vitest-environment jsdom
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { ReviewCommentField } from "./ReviewCommentField";

afterEach(() => {
	cleanup();
	vi.useRealTimers();
});

it("animates only the placeholder and stops while a comment is present", () => {
	vi.useFakeTimers();
	const onChange = vi.fn();
	const view = render(
		<ReviewCommentField value="" onChange={onChange} open isMobile={false} />,
	);
	const field = view.getByLabelText(
		"Comentario (opcional)",
	) as HTMLTextAreaElement;
	act(() => {
		vi.advanceTimersByTime(1000);
	});
	expect(field.placeholder.length).toBeGreaterThan(0);
	expect(field.value).toBe("");
	expect(onChange).not.toHaveBeenCalled();
	view.rerender(
		<ReviewCommentField
			value="My draft"
			onChange={onChange}
			open
			isMobile={false}
		/>,
	);
	const placeholder = field.placeholder;
	act(() => {
		vi.advanceTimersByTime(10000);
	});
	expect(field.value).toBe("My draft");
	expect(field.placeholder).toBe(placeholder);
	expect(vi.getTimerCount()).toBe(0);
});
