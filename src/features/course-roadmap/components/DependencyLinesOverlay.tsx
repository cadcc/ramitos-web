import { roadmapColors } from "../model/tokens";
import type { RoadmapLine } from "../hooks/useRoadmapLines";

interface DependencyLinesOverlayProps {
	lines: RoadmapLine[];
}

export function DependencyLinesOverlay({ lines }: DependencyLinesOverlayProps) {
	return (
		<svg
			aria-hidden
			data-roadmap-lines="true"
			style={{
				position: "absolute",
				inset: 0,
				width: "100%",
				height: "100%",
				pointerEvents: "none",
				overflow: "visible",
				zIndex: 20,
			}}
		>
			<defs>
				<filter
					id="roadmap-line-shadow"
					x="-30%"
					y="-30%"
					width="160%"
					height="160%"
				>
					<feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.2" />
				</filter>
			</defs>
			{lines.map((line) => (
				<path
					key={line.id}
					d={line.path}
					fill="none"
					stroke={
						line.kind === "pre"
							? roadmapColors.prerequisite
							: roadmapColors.postrequisite
					}
					strokeWidth={3}
					strokeLinecap="round"
					filter="url(#roadmap-line-shadow)"
					opacity={0.78}
				/>
			))}
		</svg>
	);
}
