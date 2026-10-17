const userAgent = process.env.npm_config_user_agent;
// pnpm 11.1.2 omits the user agent during fresh frozen-lockfile installs.
const executable = process.env.npm_execpath?.split(/[\\/]/).pop() ?? "";
const isPnpm = userAgent
	? userAgent.startsWith("pnpm/")
	: /^pnpm(?:\.(?:cjs|mjs|js|exe|cmd))?$/.test(executable);

if (!isPnpm) {
	throw new Error(
		"Use pnpm to install this project (see package.json for the pinned version).",
	);
}
