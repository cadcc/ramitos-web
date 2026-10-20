// @vitest-environment jsdom
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import Navbar from "./Navbar";
import { PREVIEW_FEATURES_KEY } from "../../hooks/usePreviewFeatures";

vi.mock("../../../features/auth", () => ({
	useAuth: () => ({
		user: { id: 1, name: "Test Student", score: 0, role: "none" },
		isAuthenticated: true,
		isAdmin: false,
		logout: vi.fn(),
		openLoginDialog: vi.fn(),
	}),
	LoginDialog: () => null,
}));
vi.mock("./ThemeSelector", () => ({ default: () => null }));
vi.mock("@tanstack/react-router", () => ({
	useNavigate: () => vi.fn(),
	Link: ({ children, to }: { children: ReactNode; to: string }) => (
		<a href={to}>{children}</a>
	),
}));

beforeEach(() => {
	localStorage.clear();
	window.dispatchEvent(
		new StorageEvent("storage", { key: PREVIEW_FEATURES_KEY }),
	);
});
afterEach(cleanup);

it("opens the preview switches from the profile dropdown", async () => {
	const view = render(<Navbar />);
	fireEvent.click(view.getByRole("button", { name: "Abrir menú de cuenta" }));
	fireEvent.click(view.getByRole("menuitem", { name: "Experimentos" }));
	await view.findByRole("dialog", { name: "Experimentos" });
	expect(view.getAllByRole("switch")).toHaveLength(4);
	fireEvent.click(view.getByRole("switch", { name: "Categorías ACM" }));
	expect(JSON.parse(localStorage.getItem(PREVIEW_FEATURES_KEY)!)).toMatchObject(
		{ acmCategories: true },
	);
});
