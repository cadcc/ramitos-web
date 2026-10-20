import { useId, useRef, useState } from "react";
import { Box, Button, IconButton, Popover, Typography } from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckIcon from "@mui/icons-material/Check";
import {
	ACM_TREE,
	getAcmNodeLabel,
	type AcmNode,
} from "../../../constants/acmTaxonomy";

interface TreeEntry {
	node: AcmNode;
	path: string;
	parent?: string;
	depth: number;
}

function flatten(nodes: AcmNode[], parent = "", depth = 0): TreeEntry[] {
	return nodes.flatMap((node) => {
		const path = parent ? `${parent}/${node.id}` : node.id;
		return [
			{ node, path, parent: parent || undefined, depth },
			...flatten(node.children ?? [], path, depth + 1),
		];
	});
}
const entries = flatten(ACM_TREE);

export function AcmTaxonomyFilter({
	value,
	onChange,
}: {
	value?: string;
	onChange: (id: string | undefined) => void;
}) {
	const id = useId();
	const [anchor, setAnchor] = useState<HTMLElement | null>(null);
	const [expanded, setExpanded] = useState<Set<string>>(new Set());
	const [focused, setFocused] = useState(entries[0]!.path);
	const refs = useRef(new Map<string, HTMLLIElement>());
	const visible = entries.filter((entry) => {
		let parent = entry.parent;
		while (parent) {
			if (!expanded.has(parent)) return false;
			parent = entries.find((candidate) => candidate.path === parent)?.parent;
		}
		return true;
	});
	const focus = (path: string) => {
		setFocused(path);
		refs.current.get(path)?.focus();
	};
	const toggle = (path: string) =>
		setExpanded((previous) => {
			const next = new Set(previous);
			if (next.has(path)) next.delete(path);
			else next.add(path);
			return next;
		});
	const select = (nodeId: string | undefined) => {
		onChange(nodeId);
		setAnchor(null);
	};
	const renderNodes = (nodes: AcmNode[], parent = "", depth = 0) =>
		nodes.map((node) => {
			const path = parent ? `${parent}/${node.id}` : node.id;
			const isExpanded = expanded.has(path);
			const hasChildren = Boolean(node.children?.length);
			return (
				<Box
					component="li"
					key={path}
					role="treeitem"
					aria-label={node.label}
					aria-selected={value === node.id}
					aria-expanded={hasChildren ? isExpanded : undefined}
					tabIndex={focused === path ? 0 : -1}
					ref={(element: HTMLLIElement | null) => {
						if (element) refs.current.set(path, element);
						else refs.current.delete(path);
					}}
					onFocus={(event) => {
						if (event.target === event.currentTarget) setFocused(path);
					}}
					onKeyDown={(event) => {
						if (
							![
								"ArrowDown",
								"ArrowUp",
								"ArrowRight",
								"ArrowLeft",
								"Home",
								"End",
								"Enter",
								" ",
							].includes(event.key)
						)
							return;
						event.preventDefault();
						event.stopPropagation();
						const index = visible.findIndex((entry) => entry.path === path);
						if (event.key === "ArrowDown")
							focus(visible[Math.min(index + 1, visible.length - 1)]!.path);
						if (event.key === "ArrowUp")
							focus(visible[Math.max(index - 1, 0)]!.path);
						if (event.key === "Home") focus(visible[0]!.path);
						if (event.key === "End") focus(visible[visible.length - 1]!.path);
						if (event.key === "ArrowRight" && hasChildren) {
							if (!isExpanded) toggle(path);
							else focus(`${path}/${node.children![0]!.id}`);
						}
						if (event.key === "ArrowLeft") {
							if (hasChildren && isExpanded) toggle(path);
							else if (parent) focus(parent);
						}
						if (event.key === "Enter" || event.key === " ") select(node.id);
					}}
					sx={{
						listStyle: "none",
						outline: "none",
						"&:focus-visible > .acm-node-row": {
							outline: "2px solid",
							outlineColor: "primary.main",
							outlineOffset: -2,
						},
					}}
				>
					<Box
						className="acm-node-row"
						onClick={() => select(node.id)}
						sx={{
							display: "flex",
							alignItems: "center",
							gap: 0.5,
							pl: 0.5 + depth * 2,
							pr: 1,
							py: 0.5,
							minHeight: 40,
							cursor: "pointer",
							borderRadius: 1,
							bgcolor: value === node.id ? "action.selected" : undefined,
							"&:hover": { bgcolor: "action.hover" },
						}}
					>
						{hasChildren ? (
							<IconButton
								size="small"
								tabIndex={-1}
								aria-label={`${isExpanded ? "Contraer" : "Expandir"} ${node.label}`}
								onClick={(event) => {
									event.stopPropagation();
									focus(path);
									toggle(path);
								}}
							>
								{isExpanded ? (
									<ExpandMoreIcon fontSize="small" />
								) : (
									<ChevronRightIcon fontSize="small" />
								)}
							</IconButton>
						) : (
							<Box sx={{ width: 30, flexShrink: 0 }} />
						)}
						<Typography
							variant="body2"
							sx={{
								flex: 1,
								fontWeight: depth === 0 ? 600 : 400,
								overflowWrap: "anywhere",
							}}
						>
							{node.label}
						</Typography>
						{value === node.id && (
							<CheckIcon color="primary" sx={{ fontSize: 18 }} />
						)}
					</Box>
					{hasChildren && isExpanded && (
						<Box component="ul" role="group" sx={{ m: 0, p: 0 }}>
							{renderNodes(node.children!, path, depth + 1)}
						</Box>
					)}
				</Box>
			);
		});

	return (
		<>
			<Button
				variant="outlined"
				aria-label={`Taxonomía ACM: ${value ? getAcmNodeLabel(value) : "Todas"}`}
				aria-haspopup="dialog"
				aria-expanded={Boolean(anchor)}
				aria-controls={anchor ? id : undefined}
				endIcon={<ExpandMoreIcon />}
				onClick={(event) => {
					const selected =
						entries.find((entry) => entry.node.id === value) ?? entries[0]!;
					const ancestors = new Set<string>();
					let parent = selected.parent;
					while (parent) {
						ancestors.add(parent);
						parent = entries.find((entry) => entry.path === parent)?.parent;
					}
					setExpanded(ancestors);
					setFocused(selected.path);
					setAnchor(event.currentTarget);
				}}
				sx={{
					width: { xs: "100%", sm: 280 },
					minWidth: 0,
					minHeight: 32,
					py: 0.5,
					px: 1.5,
					borderColor: "divider",
					borderRadius: 2,
					bgcolor: "background.paper",
					color: "text.primary",
					textTransform: "none",
					justifyContent: "space-between",
					fontSize: "0.8rem",
				}}
			>
				<Box
					component="span"
					sx={{
						overflow: "hidden",
						textOverflow: "ellipsis",
						whiteSpace: "nowrap",
					}}
				>
					{value ? getAcmNodeLabel(value) : "Taxonomía ACM · Todas"}
				</Box>
			</Button>
			<Popover
				open={Boolean(anchor)}
				anchorEl={anchor}
				onClose={() => setAnchor(null)}
				anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
				slotProps={{
					paper: {
						id,
						role: "dialog",
						"aria-label": "Taxonomía ACM",
						sx: {
							width: 440,
							maxWidth: "calc(100vw - 32px)",
							maxHeight: "min(560px, 75vh)",
							p: 1,
						},
					},
					transition: { onEntered: () => refs.current.get(focused)?.focus() },
				}}
			>
				<Typography
					variant="caption"
					color="text.secondary"
					sx={{ display: "block", px: 1, py: 0.5 }}
				>
					Selecciona un grupo, área o unidad de conocimiento.
				</Typography>
				<Button
					size="small"
					onClick={() => select(undefined)}
					sx={{ mb: 0.5, textTransform: "none" }}
				>
					Todas las áreas
				</Button>
				<Box
					component="ul"
					role="tree"
					aria-label="Clasificación ACM"
					sx={{ m: 0, p: 0 }}
				>
					{renderNodes(ACM_TREE)}
				</Box>
			</Popover>
		</>
	);
}
