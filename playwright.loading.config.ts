import { defineConfig } from "@playwright/test";
import base from "./playwright.config";

// Control API timing through Playwright instead of the development mock worker.
export default defineConfig({
	...base,
	testIgnore: [],
	testMatch: "**/catalog-loading.spec.ts",
	use: { ...base.use, baseURL: "http://127.0.0.1:4174" },
	webServer: {
		command:
			"node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 4174 --strictPort",
		url: "http://127.0.0.1:4174",
		env: { VITE_API_MOCKING_ENABLED: "false" },
	},
});
