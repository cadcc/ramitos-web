if (!process.env.npm_config_user_agent?.startsWith("pnpm/")) {
	throw new Error(
		"Use pnpm to install this project (see package.json for the pinned version).",
	);
}
