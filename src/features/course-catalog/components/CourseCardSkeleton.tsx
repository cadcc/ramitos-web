import { Box, Card, CardContent, Skeleton, Typography } from "@mui/material";
import type { ReactNode } from "react";
import {
	COURSE_CARD_MIN_HEIGHT,
	courseCardCodeSx,
	courseCardOpinionSx,
	courseCardTitleSx,
} from "./courseCard.styles";

interface CourseCardSkeletonProps {
	code?: string;
	title?: string;
}

function TextShimmer({
	children,
	width,
}: {
	children: ReactNode;
	width: number | string;
}) {
	return (
		<Box sx={{ position: "relative" }}>
			{children}
			<Skeleton
				variant="rounded"
				sx={{
					position: "absolute",
					top: "20%",
					left: 0,
					width,
					height: "60%",
				}}
			/>
		</Box>
	);
}

export function CourseCardSkeleton({ code, title }: CourseCardSkeletonProps) {
	const hasCourseLayout = Boolean(code && title);

	return (
		<Card
			aria-hidden="true"
			sx={{
				height: "100%",
				minHeight: COURSE_CARD_MIN_HEIGHT,
				display: "flex",
				flexDirection: "column",
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
				}}
			>
				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "flex-start",
						gap: 1,
					}}
				>
					<Box sx={{ minWidth: 0, flex: 1 }}>
						{hasCourseLayout ? (
							<>
								<TextShimmer width={54}>
									<Typography
										variant="overline"
										sx={{ ...courseCardCodeSx, visibility: "hidden" }}
									>
										{code}
									</Typography>
								</TextShimmer>
								<TextShimmer width="88%">
									<Typography
										variant="body1"
										sx={{ ...courseCardTitleSx, visibility: "hidden" }}
									>
										{title}
									</Typography>
								</TextShimmer>
							</>
						) : (
							<>
								<Skeleton variant="text" width={54} height={14} />
								<Skeleton variant="text" width="88%" height={22} />
								<Skeleton
									variant="text"
									width="58%"
									height={22}
									sx={{ mt: -0.5 }}
								/>
							</>
						)}
					</Box>
					<Box sx={{ flexShrink: 0 }} />
				</Box>

				<Box
					sx={{
						display: "flex",
						alignItems: "flex-end",
						justifyContent: "space-between",
						mt: "auto",
					}}
				>
					{hasCourseLayout ? (
						<TextShimmer width={72}>
							<Typography
								variant="caption"
								sx={{ ...courseCardOpinionSx, visibility: "hidden" }}
							>
								0 opiniones
							</Typography>
						</TextShimmer>
					) : (
						<Skeleton variant="text" width={72} height={16} />
					)}
					<Skeleton variant="circular" width={38} height={38} />
				</Box>
			</CardContent>
		</Card>
	);
}
