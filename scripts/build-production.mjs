import { readFileSync } from "node:fs";
import { parseEnv } from "node:util";
import { spawnSync } from "node:child_process";
import { fileURLToPath, URL } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const productionEnv = parseEnv(
	readFileSync(new URL("../production.env", import.meta.url), "utf8"),
);
// Explicit values take precedence over local Vite env files and the calling shell.
const env = { ...process.env, ...productionEnv, NODE_ENV: "production" };

for (const [script, args] of [
	["../node_modules/typescript/bin/tsc", ["-b"]],
	["../node_modules/vite/bin/vite.js", ["build", "--mode", "production"]],
]) {
	const result = spawnSync(
		process.execPath,
		[fileURLToPath(new URL(script, import.meta.url)), ...args],
		{ cwd: root, env, stdio: "inherit" },
	);
	if (result.error) throw result.error;
	if (result.status !== 0) process.exit(result.status ?? 1);
}
