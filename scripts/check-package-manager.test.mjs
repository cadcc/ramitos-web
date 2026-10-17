import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";

const script = fileURLToPath(
	new URL("./check-package-manager.mjs", import.meta.url),
);

for (const [name, variables, allowed] of [
	[
		"pnpm user agent",
		{ npm_config_user_agent: "pnpm/11.1.2 npm/? node/v26.8.1" },
		true,
	],
	[
		"frozen install without user agent",
		{ npm_execpath: "/usr/local/lib/node_modules/pnpm/bin/pnpm.cjs" },
		true,
	],
	[
		"Windows pnpm executable path",
		{ npm_execpath: "C:\\tools\\pnpm\\dist\\pnpm.mjs" },
		true,
	],
	["standalone pnpm", { npm_execpath: "/usr/local/bin/pnpm" }, true],
	[
		"npm",
		{
			npm_config_user_agent: "npm/11.0.0",
			npm_execpath: "/usr/local/bin/npm-cli.js",
		},
		false,
	],
	[
		"Yarn without user agent",
		{ npm_execpath: "/usr/local/bin/yarn.js" },
		false,
	],
	["unknown caller", {}, false],
	[
		"npm inside a pnpm directory",
		{ npm_execpath: "/tools/pnpm/npm-cli.js" },
		false,
	],
	[
		"explicit npm agent takes precedence",
		{ npm_config_user_agent: "npm/11.0.0", npm_execpath: "/tools/pnpm.cjs" },
		false,
	],
]) {
	test(name, () => {
		const env = Object.fromEntries(
			Object.entries(process.env).filter(
				([key]) =>
					!["npm_config_user_agent", "npm_execpath"].includes(
						key.toLowerCase(),
					),
			),
		);
		const result = spawnSync(process.execPath, [script], {
			env: { ...env, ...variables },
			encoding: "utf8",
		});
		assert.ifError(result.error);
		assert.equal(result.status, allowed ? 0 : 1, result.stderr);
		if (!allowed)
			assert.match(result.stderr, /Use pnpm to install this project/);
	});
}
