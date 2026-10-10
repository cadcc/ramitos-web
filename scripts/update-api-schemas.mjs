import { mkdir, writeFile } from "node:fs/promises";
import { loadEnv } from "vite";

const env = loadEnv("development", process.cwd(), "");
const base =
	process.env.VITE_API_SCHEMA_BASE_URL ||
	env.VITE_API_SCHEMA_BASE_URL ||
	env.VITE_API_BASE_URL;
if (!base)
	throw new Error("Set VITE_API_SCHEMA_BASE_URL before updating schemas.");
const services = [
	"AccountService",
	"AnonymousReviewService",
	"AuthenticationService",
	"CourseService",
	"ReviewService",
];
// Validate the entire snapshot before replacing any checked-in schema.
const schemas = await Promise.all(
	services.map(async (service) => {
		const response = await fetch(
			`${base.replace(/\/$/, "")}/docs/specs/cl.cadcc.ramitos.schema.${service}.json`,
			{ signal: AbortSignal.timeout(15000) },
		);
		if (!response.ok) throw new Error(`${service}: HTTP ${response.status}`);
		const schema = await response.json();
		if (!schema.openapi || !schema.paths)
			throw new Error(`${service}: invalid OpenAPI document`);
		return [service, schema];
	}),
);
await mkdir("api/schemas", { recursive: true });
for (const [service, schema] of schemas) {
	await writeFile(
		`api/schemas/${service}.json`,
		JSON.stringify(schema, null, 2) + "\n",
	);
}
console.log(
	"Updated five API schemas. Run pnpm generate:api and review the diff.",
);
