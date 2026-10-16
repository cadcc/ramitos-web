// @vitest-environment jsdom
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { REVIEW_TAG_SECTIONS } from "../../../constants/reviewTags";
import { ReviewExtraTagSection } from "./ReviewExtraTagSection";

afterEach(cleanup);

it.each(REVIEW_TAG_SECTIONS.filter((section) => !section.axis))(
	"starts $label collapsed, supports toggling, and opens when all axes are rated",
	(section) => {
		const props = { section, selectedTags: [], onToggleTag: vi.fn() };
		const view = render(
			<ReviewExtraTagSection {...props} allAxesRated={false} />,
		);
		const toggle = view.getByRole("button", { name: section.label });
		expect(toggle.getAttribute("aria-expanded")).toBe("false");
		fireEvent.click(toggle);
		expect(toggle.getAttribute("aria-expanded")).toBe("true");
		fireEvent.click(toggle);
		view.rerender(<ReviewExtraTagSection {...props} allAxesRated />);
		expect(toggle.getAttribute("aria-expanded")).toBe("true");
		fireEvent.click(toggle);
		view.rerender(<ReviewExtraTagSection {...props} allAxesRated />);
		expect(toggle.getAttribute("aria-expanded")).toBe("false");
	},
);
