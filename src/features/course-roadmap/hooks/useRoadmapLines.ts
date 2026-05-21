import { useCallback, useLayoutEffect, useRef, useState } from "react";
import type { RoadmapCourse, RoadmapSelection } from "../model/types";

export interface RoadmapLine {
	id: string;
	kind: "pre" | "post";
	path: string;
}

interface UseRoadmapLinesInput {
	boardRef: React.RefObject<HTMLElement | null>;
	cardRefs: React.MutableRefObject<Map<string, HTMLElement>>;
	selection: RoadmapSelection;
	showLines: boolean;
	editMode: boolean;
	visibleCourseIds: Set<string>;
	coursesById: Map<string, RoadmapCourse>;
}

export function useRoadmapLines({
	boardRef,
	cardRefs,
	selection,
	showLines,
	editMode,
	visibleCourseIds,
	coursesById,
}: UseRoadmapLinesInput) {
	const [lines, setLines] = useState<RoadmapLine[]>([]);
	const frameRef = useRef<number | null>(null);

	const recalculate = useCallback(() => {
		const board = boardRef.current;
		const selectedId = selection.selectedCourseId;
		const selectedEl = selectedId ? cardRefs.current.get(selectedId) : null;
		if (!board || !selectedId || !selectedEl || !showLines || editMode) {
			setLines((current) => (current.length === 0 ? current : []));
			return;
		}

		const boardRect = board.getBoundingClientRect();
		const next: RoadmapLine[] = [];
		const prerequisiteTreeIds = new Set([
			selectedId,
			...selection.prerequisiteDepths.keys(),
		]);
		const postrequisiteTreeIds = new Set([
			selectedId,
			...selection.postrequisiteDepths.keys(),
		]);

		for (const targetId of prerequisiteTreeIds) {
			const target = coursesById.get(targetId);
			if (!target || !visibleCourseIds.has(targetId)) continue;

			for (const prerequisiteId of target.prerequisites) {
				if (
					prerequisiteTreeIds.has(prerequisiteId) &&
					visibleCourseIds.has(prerequisiteId)
				) {
					addLine(next, {
						boardRect,
						cardRefs,
						fromId: prerequisiteId,
						toId: targetId,
						kind: "pre",
					});
				}
			}
		}

		for (const sourceId of postrequisiteTreeIds) {
			const source = coursesById.get(sourceId);
			if (!source || !visibleCourseIds.has(sourceId)) continue;

			for (const postrequisiteId of source.postrequisites) {
				if (
					postrequisiteTreeIds.has(postrequisiteId) &&
					visibleCourseIds.has(postrequisiteId)
				) {
					addLine(next, {
						boardRect,
						cardRefs,
						fromId: sourceId,
						toId: postrequisiteId,
						kind: "post",
					});
				}
			}
		}

		setLines((current) => (areLinesEqual(current, next) ? current : next));
	}, [
		boardRef,
		cardRefs,
		coursesById,
		editMode,
		selection,
		showLines,
		visibleCourseIds,
	]);

	useLayoutEffect(() => {
		const board = boardRef.current;
		const scheduleRecalculate = () => {
			if (frameRef.current !== null) return;
			frameRef.current = window.requestAnimationFrame(() => {
				frameRef.current = null;
				recalculate();
			});
		};
		const resizeObserver =
			typeof ResizeObserver !== "undefined"
				? new ResizeObserver(scheduleRecalculate)
				: null;

		scheduleRecalculate();
		if (board) {
			board.addEventListener("scroll", scheduleRecalculate, { passive: true });
			resizeObserver?.observe(board);
		}
		window.addEventListener("resize", scheduleRecalculate, { passive: true });
		return () => {
			if (frameRef.current !== null) {
				window.cancelAnimationFrame(frameRef.current);
				frameRef.current = null;
			}
			if (board) {
				board.removeEventListener("scroll", scheduleRecalculate);
			}
			resizeObserver?.disconnect();
			window.removeEventListener("resize", scheduleRecalculate);
		};
	}, [boardRef, recalculate]);

	return lines;
}

function addLine(
	lines: RoadmapLine[],
	{
		boardRect,
		cardRefs,
		fromId,
		toId,
		kind,
	}: {
		boardRect: DOMRect;
		cardRefs: React.MutableRefObject<Map<string, HTMLElement>>;
		fromId: string;
		toId: string;
		kind: "pre" | "post";
	},
) {
	const fromEl = cardRefs.current.get(fromId);
	const toEl = cardRefs.current.get(toId);
	if (!fromEl || !toEl) return;

	const fromRect = fromEl.getBoundingClientRect();
	const toRect = toEl.getBoundingClientRect();
	const from = {
		x: fromRect.left - boardRect.left + fromRect.width / 2,
		y: fromRect.bottom - boardRect.top,
	};
	const to = {
		x: toRect.left - boardRect.left + toRect.width / 2,
		y: toRect.top - boardRect.top,
	};

	lines.push({
		id: `${kind}:${fromId}->${toId}`,
		kind,
		path: curvedPath(from.x, from.y, to.x, to.y),
	});
}

function curvedPath(x1: number, y1: number, x2: number, y2: number) {
	const deltaX = x2 - x1;
	if (Math.abs(deltaX) < 12) {
		const bow = 18;
		const direction = x1 < 140 ? 1 : -1;
		const controlX = x1 + bow * direction;
		const midY = y1 + (y2 - y1) / 2;
		return `M ${x1} ${y1} C ${controlX} ${midY}, ${controlX} ${midY}, ${x2} ${y2}`;
	}

	const handleY = (y2 - y1) * 0.35;
	return `M ${x1} ${y1} C ${x1} ${y1 + handleY}, ${x2} ${y2 - handleY}, ${x2} ${y2}`;
}

function areLinesEqual(current: RoadmapLine[], next: RoadmapLine[]) {
	if (current.length !== next.length) return false;
	return current.every((line, index) => {
		const nextLine = next[index];
		return (
			nextLine &&
			line.id === nextLine.id &&
			line.kind === nextLine.kind &&
			line.path === nextLine.path
		);
	});
}
