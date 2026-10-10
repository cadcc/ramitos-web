import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { initializeMocking } from "./shared/api/initializeMocking";

const router = createRouter({
	routeTree,
	scrollRestoration: true,
	defaultPreload: "intent",
});

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

initializeMocking()
	.then(() => {
		const root = document.getElementById("root");
		if (!root) throw new Error("Missing application root");
		createRoot(root).render(
			<StrictMode>
				<RouterProvider router={router} />
			</StrictMode>,
		);
	})
	.catch(() => {
		const root = document.getElementById("root");
		if (root)
			root.textContent =
				"No pudimos iniciar la aplicación. Recarga la página para intentar de nuevo.";
	});
