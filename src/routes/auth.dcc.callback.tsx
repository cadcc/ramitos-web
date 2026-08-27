import { createFileRoute } from "@tanstack/react-router";
import {
	DccLoginCallbackPage,
	type DccLoginCallbackParams,
} from "../features/auth";

export const Route = createFileRoute("/auth/dcc/callback")({
	validateSearch: (
		search: Record<string, unknown>,
	): DccLoginCallbackParams => ({
		returnTo: typeof search.returnTo === "string" ? search.returnTo : undefined,
		secret: typeof search.secret === "string" ? search.secret : undefined,
		status: typeof search.status === "string" ? search.status : undefined,
		workflow: typeof search.workflow === "string" ? search.workflow : undefined,
	}),
	component: DccLoginCallbackRoute,
});

function DccLoginCallbackRoute() {
	return <DccLoginCallbackPage {...Route.useSearch()} />;
}
