import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { initializeMocking } from "./shared/api/msw/browser";

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

initializeMocking().then(() =>
	createRoot(document.getElementById("root")!).render(
		<StrictMode>
			<RouterProvider router={router} />
		</StrictMode>,
	),
);
