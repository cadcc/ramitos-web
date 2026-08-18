import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");

	return {
		plugins: [
			tanstackRouter({
				routesDirectory: "./src/routes",
				generatedRouteTree: "./src/routeTree.gen.ts",
				autoCodeSplitting: true,
			}),
			react(),
		],
		server: {
			proxy: {
				"/api": {
					target: env.VITE_API_BASE_URL,
					changeOrigin: true,
					secure: env.VITE_API_PROXY_SECURE !== "false",
				},
			},
		},
	};
});
