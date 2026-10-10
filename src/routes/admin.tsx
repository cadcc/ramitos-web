import { createFileRoute, redirect } from "@tanstack/react-router";
import { AdminDashboard } from "../features/admin";

export const Route = createFileRoute("/admin")({
	beforeLoad: () => {
		const stored = localStorage.getItem("ramitos-user");
		if (!stored) return redirect({ to: "/" });
		try {
			const user: unknown = JSON.parse(stored);
			if (
				typeof user !== "object" ||
				user === null ||
				!("role" in user) ||
				(user.role !== "admin" && user.role !== "mod")
			)
				return redirect({ to: "/" });
		} catch {
			return redirect({ to: "/" });
		}
		return undefined;
	},
	component: AdminDashboard,
});
