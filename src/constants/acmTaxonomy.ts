import taxonomy from "../../data/courses/acm-taxonomy.json";

export interface AcmNode {
	id: string;
	label: string;
	children?: AcmNode[];
}

const knowledgeAreas: AcmNode[] = taxonomy.cuerpo_de_conocimientos.map(
	(area) => ({
		id: area.id,
		label: area.nombre,
		children: area.unidades_conocimiento.map((unit) => ({
			id: unit.id,
			label: unit.nombre,
		})),
	}),
);

export const ACM_TREE: AcmNode[] = taxonomy.areas_competenciales.map(
	(group) => ({
		id: group.id,
		label: group.nombre,
		children: group.areas_conocimiento
			.map((id) => knowledgeAreas.find((area) => area.id === id)!)
			.filter(Boolean),
	}),
);

const nodesById = new Map<string, AcmNode>();
const unitsByNode = new Map<string, Set<string>>();
function indexNode(node: AcmNode): Set<string> {
	nodesById.set(node.id, node);
	const units = new Set(
		node.children
			? node.children.flatMap((child) => [...indexNode(child)])
			: [node.id],
	);
	unitsByNode.set(node.id, units);
	return units;
}
ACM_TREE.forEach(indexNode);

export const ACM_NODE_IDS = [...nodesById.keys()];

export function getAcmAreaUnits(
	units: readonly string[],
	areaId?: string,
): AcmNode[] {
	const area = knowledgeAreas.find((candidate) => candidate.id === areaId);
	const assigned = new Set(units);
	return area?.children?.filter((unit) => assigned.has(unit.id)) ?? [];
}

export function getAcmClassificationTree(units: readonly string[]): AcmNode[] {
	const selected = new Set(units);
	function prune(node: AcmNode): AcmNode[] {
		if (!node.children) return selected.has(node.id) ? [node] : [];
		const children = node.children.flatMap(prune);
		return children.length ? [{ ...node, children }] : [];
	}
	return ACM_TREE.flatMap(prune);
}

export function getAcmNodeLabel(id: string): string | undefined {
	return nodesById.get(id)?.label;
}

export function matchesAcmNode(
	units: readonly string[],
	nodeId: string,
): boolean {
	const allowed = unitsByNode.get(nodeId);
	return units.some((unit) => allowed?.has(unit));
}

export const ACM_AREA_OPTIONS = taxonomy.cuerpo_de_conocimientos.map(
	(area) => ({
		id: area.id,
		label: area.nombre,
	}),
);

const areaByUnit = new Map(
	taxonomy.cuerpo_de_conocimientos.flatMap((area) =>
		area.unidades_conocimiento.map((unit) => [unit.id, area.id] as const),
	),
);

export function getAcmAreas(units: readonly string[]): string[] {
	return [
		...new Set(
			units
				.map((unit) => areaByUnit.get(unit))
				.filter((id): id is string => id !== undefined),
		),
	];
}
