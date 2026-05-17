import { createFileRoute, redirect } from "@tanstack/react-router";
import { AdminDashboard } from "../features/admin";

export const Route = createFileRoute("/admin")({
	beforeLoad: () => {
		const stored = localStorage.getItem("ramitos-user");
		if (!stored) throw redirect({ to: "/" });
		try {
			const user = JSON.parse(stored);
			if (user.role !== "admin" && user.role !== "mod")
				throw redirect({ to: "/" });
		} catch {
			throw redirect({ to: "/" });
		}
	},
	component: AdminDashboard,
});
