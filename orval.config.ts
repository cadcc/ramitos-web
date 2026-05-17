import { defineConfig } from "orval";
import type { Options } from "orval";
import { loadEnv } from "vite";

const env = loadEnv("development", process.cwd(), "");
const BASE_URL = env.VITE_API_BASE_URL || "http://localhost:8000";

function serviceConfig(schemaName: string, folderName: string): Options {
	return {
        // TODO: add fallback/cached input
		input: `${BASE_URL}/docs/specs/cl.cadcc.ramitos.schema.${schemaName}.json`,
		output: {
			client: "react-query",
			target: `src/generated/api/${folderName}`,
			schemas: `src/generated/api/${folderName}/models`,
			mode: "split",
			formatter: "prettier",
			clean: true,
			mock: true,
		},
	};
}

export default defineConfig({
	account: serviceConfig("AccountService", "account"),
	anonymousReview: serviceConfig("AnonymousReviewService", "anonymous-review"),
	authentication: serviceConfig("AuthenticationService", "authentication"),
	course: serviceConfig("CourseService", "course"),
	review: serviceConfig("ReviewService", "review"),

	// TODO: figure out how to use zod with react-query (is it even usable?)
});
