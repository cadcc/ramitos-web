import { useCallback, useLayoutEffect, useRef, useState } from "react";
import type { RoadmapSelection } from "../model/types";

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
}

export function useRoadmapLines({
	boardRef,
	cardRefs,
	selection,
	showLines,
	editMode,
	visibleCourseIds,
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
		const selectedRect = selectedEl.getBoundingClientRect();
		const selectedTop = {
			x: selectedRect.left - boardRect.left + selectedRect.width / 2,
			y: selectedRect.top - boardRect.top,
		};
		const selectedBottom = {
			x: selectedRect.left - boardRect.left + selectedRect.width / 2,
			y: selectedRect.bottom - boardRect.top,
		};

		const next: RoadmapLine[] = [];
		for (const [courseId] of selection.prerequisiteDepths) {
			if (!visibleCourseIds.has(courseId)) continue;
			const el = cardRefs.current.get(courseId);
			if (!el) continue;
			const rect = el.getBoundingClientRect();
			const from = {
				x: rect.left - boardRect.left + rect.width / 2,
				y: rect.bottom - boardRect.top,
			};
			next.push({
				id: `pre:${courseId}`,
				kind: "pre",
				path: curvedPath(from.x, from.y, selectedTop.x, selectedTop.y),
			});
		}

		for (const [courseId] of selection.postrequisiteDepths) {
			if (!visibleCourseIds.has(courseId)) continue;
			const el = cardRefs.current.get(courseId);
			if (!el) continue;
			const rect = el.getBoundingClientRect();
			const to = {
				x: rect.left - boardRect.left + rect.width / 2,
				y: rect.top - boardRect.top,
			};
			next.push({
				id: `post:${courseId}`,
				kind: "post",
				path: curvedPath(selectedBottom.x, selectedBottom.y, to.x, to.y),
			});
		}

		setLines((current) => (areLinesEqual(current, next) ? current : next));
	}, [boardRef, cardRefs, editMode, selection, showLines, visibleCourseIds]);

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

function curvedPath(x1: number, y1: number, x2: number, y2: number) {
	const deltaX = x2 - x1;
	if (Math.abs(deltaX) < 12) {
		const bow = 34;
		const direction = x1 < 140 ? 1 : -1;
		const controlX = x1 + bow * direction;
		const midY = y1 + (y2 - y1) / 2;
		return `M ${x1} ${y1} C ${controlX} ${midY}, ${controlX} ${midY}, ${x2} ${y2}`;
	}

	const midY = y1 + (y2 - y1) / 2;
	return `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
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
