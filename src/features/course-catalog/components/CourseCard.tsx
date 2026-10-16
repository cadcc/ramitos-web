import { CourseCardTitle } from "./CourseCardTitle";
import { Card, CardContent, Typography, Box, Tooltip } from "@mui/material";
import { Link } from "@tanstack/react-router";
import type { CursoListItem } from "../../../shared/types/domain";
import {
	getAverageScore,
	getRadarColor,
} from "../../../constants/courseDisplay";
import { DEFAULT_REVIEW_SORT } from "../../../constants/reviews";
import {
	COURSE_CARD_MIN_HEIGHT,
	courseCardCodeSx,
	courseCardOpinionSx,
} from "./courseCard.styles";
import { MiniRadar } from "./MiniRadar";

const CURRENT_SEMESTER = "2026-1";

interface Props {
	course: CursoListItem;
	index: number;
	showReviewableIndicator?: boolean;
}

export default function CourseCard({
	course,
	showReviewableIndicator = false,
}: Props) {
	const isCurrent = course.lastOffered === CURRENT_SEMESTER;

	return (
		<Card
			sx={{
				position: "relative",
				overflow: "visible",
				height: "100%",
				minHeight: COURSE_CARD_MIN_HEIGHT,
				display: "flex",
				flexDirection: "column",
				"&:hover": {
					borderColor: "primary.main",
					transform: "translateY(-2px)",
					transition: "all 0.15s ease",
				},
			}}
		>
			{showReviewableIndicator && (
				<Tooltip title="Puedes opinar" arrow>
					<Box
						component="span"
						role="img"
						aria-label="Puedes opinar"
						tabIndex={0}
						sx={{
							position: "absolute",
							top: 0,
							right: 0,
							transform: "translate(35%, -35%)",
							zIndex: 1,
							border: "2px solid",
							borderColor: "background.paper",
							width: 16,
							height: 16,
							borderRadius: "50%",
							bgcolor: "success.main",
						}}
					/>
				</Tooltip>
			)}
			<Link
				to="/curso/$cursoId"
				params={{ cursoId: course.id }}
				search={{ reviewSort: DEFAULT_REVIEW_SORT }}
				style={{
					textDecoration: "none",
					color: "inherit",
					display: "flex",
					flexGrow: 1,
				}}
			>
				<CardContent
					sx={{
						display: "flex",
						flexDirection: "column",
						gap: 0.75,
						width: "100%",
						p: 2,
						"&:last-child": { pb: 2 },
						cursor: "pointer",
					}}
				>
					{/* Top: code + name | semester */}
					<Box
						sx={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "flex-start",
							gap: 1,
						}}
					>
						<Box sx={{ minWidth: 0, flex: 1 }}>
							<Typography
								variant="overline"
								color="primary"
								sx={{ ...courseCardCodeSx, pr: 7 }}
							>
								{course.code}
							</Typography>
							<CourseCardTitle title={course.name} />
						</Box>
						<Typography
							variant="caption"
							sx={{
								position: "absolute",
								top: 16,
								right: 16,
								fontSize: "0.7rem",
								fontWeight: 700,
								color: isCurrent ? "success.main" : "text.secondary",
								mt: 0.25,
							}}
						>
							{course.lastOffered}
						</Typography>
					</Box>

					{/* Bottom: opinions | mini radar */}
					<Box
						sx={{
							display: "flex",
							alignItems: "flex-end",
							justifyContent: "space-between",
							mt: "auto",
						}}
					>
						{course.reviewCount > 0 && (
							<Typography
								variant="caption"
								color="text.secondary"
								sx={courseCardOpinionSx}
							>
								{course.reviewCount}{" "}
								{course.reviewCount === 1 ? "opinión" : "opiniones"}
							</Typography>
						)}
						<Box
							sx={{
								ml: "auto",
								color: (theme) =>
									getRadarColor(theme, getAverageScore(course.ratings)),
								lineHeight: 0,
							}}
						>
							{course.reviewCount > 0 ? (
								<MiniRadar ratings={course.ratings} />
							) : (
								<Box aria-hidden sx={{ width: 38, height: 38 }} />
							)}
						</Box>
					</Box>
				</CardContent>
			</Link>
		</Card>
	);
}
