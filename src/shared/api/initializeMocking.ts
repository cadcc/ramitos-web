export async function initializeMocking(): Promise<void> {
	if (
		import.meta.env.DEV &&
		import.meta.env.VITE_API_MOCKING_ENABLED === "true"
	) {
		const { startMocking } = await import("./msw/browser");
		await startMocking();
		return;
	}
	if (!("serviceWorker" in navigator)) return;
	const registrations = await navigator.serviceWorker.getRegistrations();
	await Promise.all(
		registrations
			.filter((registration) =>
				registration.active?.scriptURL.endsWith("/mockServiceWorker.js"),
			)
			.map((registration) => registration.unregister()),
	);
}
