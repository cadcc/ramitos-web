// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import {
	createMemoryHistory,
	createRootRoute,
	createRoute,
	createRouter,
	RouterProvider,
} from "@tanstack/react-router";
import { CourseAcmClassifications } from "./CourseAcmClassifications";

afterEach(cleanup);

function renderClassifications(units: string[]) {
	const root = createRootRoute();
	const route = createRoute({
		getParentRoute: () => root,
		path: "/",
		component: () => <CourseAcmClassifications units={units} />,
	});
	const router = createRouter({
		routeTree: root.addChildren([route]),
		history: createMemoryHistory({ initialEntries: ["/"] }),
	});
	return render(<RouterProvider router={router} />);
}

it("shows all three levels with links that filter by their IDs", async () => {
	const view = renderClassifications(["IA-AA", "IA-PLN"]);
	await view.findByRole("region", { name: "Clasificación ACM" });
	for (const [label, id] of [
		["Desarrollo de Aplicaciones", "APLICACIONES"],
		["Inteligencia Artificial", "IA"],
		["Aprendizaje Automático", "IA-AA"],
		["Procesamiento del Lenguaje Natural", "IA-PLN"],
	]) {
		const link = view.getByRole("link", { name: label });
		expect(
			new URL(link.getAttribute("href")!, "http://localhost").searchParams.get(
				"acmArea",
			),
		).toBe(id);
	}
	expect(view.queryByText("Sistemas Operativos")).toBeNull();
});

it("retains both competency parents of shared knowledge areas", async () => {
	const view = renderClassifications(["GD-Consultas"]);
	await view.findByRole("region", { name: "Clasificación ACM" });
	expect(
		view.getByRole("link", { name: "Desarrollo de Sistemas" }),
	).toBeDefined();
	expect(
		view.getByRole("link", { name: "Desarrollo de Aplicaciones" }),
	).toBeDefined();
	expect(
		view.getAllByRole("link", { name: "Creación de Consultas" }),
	).toHaveLength(2);
});

it("omits the section when classifications are absent", () => {
	const view = render(<CourseAcmClassifications units={[]} />);
	expect(view.container.innerHTML).toBe("");
});
