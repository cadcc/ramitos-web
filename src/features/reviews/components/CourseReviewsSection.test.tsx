// @vitest-environment jsdom
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { CourseReviewsSection } from "./CourseReviewsSection";

const auth = vi.hoisted(() => ({
	user: { id: 1 },
	isAuthenticated: true,
	openLoginDialog: vi.fn(),
}));
vi.mock("../../auth", () => ({ useAuth: () => auth }));
vi.mock("../hooks/useCourseReviews", () => ({
	useCourseReviews: () => ({
		reviewsQuery: {},
		reviews: [],
		total: 0,
		targetFound: false,
	}),
	useOwnCourseReview: () => ({ data: null }),
}));
vi.mock("./ReviewCard", () => ({
	CourseReviewCard: () => null,
	OwnCourseReviewCard: () => null,
}));
vi.mock("./ReviewForm", () => ({
	CreateReviewForm: ({ open }: { open: boolean }) =>
		open ? <div>Review form opened</div> : null,
	EditReviewForm: () => null,
}));
afterEach(() => {
	cleanup();
	auth.isAuthenticated = true;
});
const props = {
	commentReviewCount: 23,
	cursoId: "CC1000",
	reviewSort: "newest" as const,
	onReviewSortChange: vi.fn(),
};

it("shows the backend comment count independently of loaded reviews", () => {
	const view = render(<CourseReviewsSection {...props} />);
	expect(view.getByRole("heading", { name: "Comentarios (23)" })).toBeTruthy();
});

it("replaces the action when the course is not reviewable", () => {
	const view = render(<CourseReviewsSection {...props} reviewable={false} />);
	expect(view.queryByRole("button", { name: "Opinar" })).toBeNull();
	expect(view.getByText("No has cursado este ramo.")).toBeTruthy();
});
it("does not interpret unknown eligibility as not having taken the course", () => {
	const view = render(<CourseReviewsSection {...props} />);
	expect(view.getByText("No pudimos verificar si puedes opinar.")).toBeTruthy();
	expect(view.queryByRole("button", { name: "Opinar" })).toBeNull();
});
it("opens the form for an eligible user", () => {
	const view = render(<CourseReviewsSection {...props} reviewable />);
	fireEvent.click(view.getByRole("button", { name: "Opinar" }));
	expect(view.getByText("Review form opened")).toBeTruthy();
});
it("shows one prominent action below the invitation for an eligible empty course", () => {
	const view = render(
		<CourseReviewsSection {...props} commentReviewCount={0} reviewable />,
	);
	const invitation = view.getByText("¡Sé la primera persona en opinar!");
	const buttons = view.getAllByRole("button", { name: "Opinar" });
	expect(buttons).toHaveLength(1);
	expect(invitation.parentElement?.contains(buttons[0]!)).toBe(true);
	fireEvent.click(buttons[0]!);
	expect(view.getByText("Review form opened")).toBeTruthy();
});
it("still invites signed-out users to log in", () => {
	auth.isAuthenticated = false;
	const view = render(<CourseReviewsSection {...props} />);
	fireEvent.click(view.getByRole("button", { name: "Opinar" }));
	expect(auth.openLoginDialog).toHaveBeenCalled();
});
