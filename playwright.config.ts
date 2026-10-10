import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	testDir: "./e2e",
	expect: { timeout: 15000 },
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	use: { baseURL: "http://127.0.0.1:4173", trace: "retain-on-failure" },
	projects: [
		{ name: "desktop", use: { ...devices["Desktop Chrome"] } },
		{ name: "mobile", use: { ...devices["Pixel 7"] } },
	],
	webServer: {
		command:
			"node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 4173 --strictPort",
		url: "http://127.0.0.1:4173",
		env: {
			VITE_API_MOCKING_ENABLED: "true",
			VITE_AUTH_API_ORIGIN: "http://127.0.0.1:4173",
		},
	},
});
