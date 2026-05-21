import { Link } from "@tanstack/react-router";
import { Box, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { memo } from "react";
import { roadmapColors, roadmapSizes } from "../model/tokens";
import { opacityForDepth } from "../model/roadmapLogic";
import type {
	RoadmapCourse,
	RoadmapMark,
	RoadmapSelection,
} from "../model/types";

interface RoadmapCourseCardProps {
	course: RoadmapCourse;
	editMode: boolean;
	mark: RoadmapMark;
	selection: RoadmapSelection;
	onSelect: (courseId: string | null) => void;
	onClick: (courseId: string) => void;
	registerCard: (courseId: string, el: HTMLElement | null) => void;
}

function RoadmapCourseCardComponent({
	course,
	editMode,
	mark,
	selection,
	onSelect,
	onClick,
	registerCard,
}: RoadmapCourseCardProps) {
	const relation = getRelation(course.id, selection);
	const markColor = mark ? roadmapColors.marks[mark] : null;
	const isDetailCourse =
		course.type === "course" || course.type === "compactable";
	const linkProps =
		isDetailCourse && !editMode
			? {
					component: Link,
					to: "/curso/$cursoId",
					params: { cursoId: course.code },
				}
			: { component: "div" as const };

	return (
		<Box
			{...linkProps}
			ref={(el: HTMLElement | null) => registerCard(course.id, el)}
			role="listitem"
			tabIndex={0}
			data-course-id={course.id}
			data-marked={mark ? "true" : "false"}
			aria-label={`${course.code}, ${course.name}`}
			onMouseEnter={() => onSelect(course.id)}
			onMouseLeave={() => onSelect(null)}
			onFocus={() => onSelect(course.id)}
			onBlur={() => onSelect(null)}
			onClick={(event) => {
				if (editMode || !isDetailCourse) {
					event.preventDefault();
					onClick(course.id);
				}
			}}
			sx={{
				position: "relative",
				zIndex: 1,
				width: {
					xs: roadmapSizes.courseWidthSmall,
					sm: roadmapSizes.courseWidth,
				},
				height: roadmapSizes.courseHeight,
				flex: "0 0 auto",
				borderRadius: 1,
				overflow: "hidden",
				cursor: "pointer",
				textDecoration: "none",
				userSelect: "none",
				contain: "layout paint style",
				bgcolor: markColor ?? "background.default",
				color: markColor ? "primary.contrastText" : "text.primary",
				border: 1,
				borderColor: markColor ?? "divider",
				boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
				transition:
					"transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease, border-color 0.15s ease",
				opacity:
					relation.depth === undefined ? 1 : opacityForDepth(relation.depth),
				outline: "none",
				...(relation.kind === "selected" && !editMode
					? {
							bgcolor: "background.paper",
							borderColor: getDepartmentAccent(course.department),
							boxShadow: (theme) =>
								`0 0 0 3px ${alpha(theme.palette.primary.main, 0.14)}, 0 8px 20px rgba(0,0,0,0.16)`,
							transform: "translateY(-2px)",
						}
					: {}),
				...(relation.kind === "pre" && !editMode
					? dependencyStyles(roadmapColors.prerequisite)
					: {}),
				...(relation.kind === "post" && !editMode
					? dependencyStyles(roadmapColors.postrequisite)
					: {}),
				"&:hover, &:focus-visible": {
					transform: "translateY(-2px)",
					boxShadow: "0 8px 18px rgba(0,0,0,0.18)",
					borderColor: isDetailCourse && !editMode ? "primary.main" : "divider",
				},
			}}
		>
			<Box
				sx={{
					px: 0.9,
					pt: 0.7,
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					gap: 1,
					color: markColor ? "primary.contrastText" : "text.secondary",
					fontSize: "0.72rem",
					fontWeight: 800,
				}}
			>
				<Typography
					component="span"
					sx={{ fontSize: "0.7rem", fontWeight: 800 }}
				>
					{course.code}
				</Typography>
				<Typography
					component="span"
					aria-label={`${course.credits} creditos`}
					sx={{ fontSize: "0.7rem", fontWeight: 800 }}
				>
					{course.credits}
				</Typography>
			</Box>
			<Box
				sx={{
					height: "calc(100% - 28px)",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					textAlign: "center",
					px: 0.75,
				}}
			>
				<Typography
					sx={{
						fontSize: { xs: "0.72rem", sm: "0.78rem" },
						fontWeight: 700,
						lineHeight: 1.12,
						fontStyle: mark ? "italic" : "normal",
					}}
				>
					{course.shortname ?? course.name}
				</Typography>
			</Box>
		</Box>
	);
}

export const RoadmapCourseCard = memo(
	RoadmapCourseCardComponent,
	(previous, next) =>
		previous.course === next.course &&
		previous.editMode === next.editMode &&
		previous.mark === next.mark &&
		previous.onSelect === next.onSelect &&
		previous.onClick === next.onClick &&
		previous.registerCard === next.registerCard &&
		relationKey(previous.course.id, previous.selection) ===
			relationKey(next.course.id, next.selection),
);

function getRelation(courseId: string, selection: RoadmapSelection) {
	if (selection.selectedCourseId === courseId) {
		return { kind: "selected" as const, depth: 0 };
	}
	if (selection.prerequisiteDepths.has(courseId)) {
		return {
			kind: "pre" as const,
			depth: selection.prerequisiteDepths.get(courseId),
		};
	}
	if (selection.postrequisiteDepths.has(courseId)) {
		return {
			kind: "post" as const,
			depth: selection.postrequisiteDepths.get(courseId),
		};
	}
	return { kind: null, depth: undefined };
}

function relationKey(courseId: string, selection: RoadmapSelection) {
	const relation = getRelation(courseId, selection);
	return `${relation.kind ?? "none"}:${relation.depth ?? ""}`;
}

function dependencyStyles(color: string) {
	return {
		bgcolor: "background.paper",
		borderColor: color,
		boxShadow: `0 0 0 3px ${color}`,
		color: "text.primary",
	};
}

function getDepartmentAccent(department: string) {
	const accents = [
		"primary.main",
		"secondary.main",
		"success.main",
		"info.main",
		"warning.main",
		"error.main",
	];
	const index =
		Array.from(department).reduce(
			(total, char) => total + char.charCodeAt(0),
			0,
		) % accents.length;
	return accents[index];
}
