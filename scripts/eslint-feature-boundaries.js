import path from "node:path";

export default {
	meta: {
		type: "problem",
		schema: [],
		messages: {
			privateImport: "Import another feature through its index.ts public API.",
		},
	},
	create(context) {
		const source = context.filename.replaceAll("\\", "/");
		const owner = source.match(/\/src\/features\/([^/]+)\//)?.[1];
		function check(node) {
			const specifier = node.source?.value;
			if (typeof specifier !== "string" || !specifier.startsWith(".")) return;
			const target = path
				.resolve(path.dirname(context.filename), specifier)
				.replaceAll("\\", "/");
			const match = target.match(/\/src\/features\/([^/]+)(?:\/(.*))?$/);
			if (
				match &&
				match[1] !== owner &&
				match[2] &&
				!/^index(?:\.ts)?$/.test(match[2])
			) {
				context.report({ node, messageId: "privateImport" });
			}
		}
		return {
			ImportDeclaration: check,
			ExportNamedDeclaration: check,
			ExportAllDeclaration: check,
		};
	},
};
