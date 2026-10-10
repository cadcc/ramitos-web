import featureBoundaries from "./scripts/eslint-feature-boundaries.js";
import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import prettier from "eslint-config-prettier";

export default defineConfig(
	globalIgnores([
		"dist/**",
		"node_modules/**",
		"src/generated/**",
		"src/routeTree.gen.ts",
		"public/**",
		".agents/**",
		".tanstack/**",
		"coverage/**",
		"playwright-report/**",
		"test-results/**",
	]),
	{
		files: ["**/*.{js,mjs}"],
		extends: [js.configs.recommended],
		languageOptions: {
			globals: {
				process: "readonly",
				console: "readonly",
				fetch: "readonly",
				AbortSignal: "readonly",
			},
		},
	},
	{
		files: ["**/*.{ts,tsx}"],
		extends: [js.configs.recommended, tseslint.configs.recommendedTypeChecked],
		languageOptions: {
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
		plugins: {
			"react-hooks": reactHooks,
			local: { rules: { "feature-boundaries": featureBoundaries } },
		},
		rules: {
			"local/feature-boundaries": "error",
			"react-hooks/rules-of-hooks": "error",
			"react-hooks/exhaustive-deps": "error",
			"@typescript-eslint/consistent-type-imports": "error",
		},
	},
	{
		files: ["src/**/*.{ts,tsx}"],
		ignores: ["src/features/*/api/**", "src/shared/api/msw/**"],
		rules: {
			"no-restricted-imports": [
				"error",
				{
					patterns: [
						{
							group: ["**/generated/**"],
							message:
								"Use a feature API adapter instead of importing generated clients here.",
						},
					],
				},
			],
		},
	},
	prettier,
);
