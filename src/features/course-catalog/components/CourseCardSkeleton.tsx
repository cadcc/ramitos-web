import { CourseCardTitle } from "./CourseCardTitle";
import { Box, Card, CardContent, Skeleton, Typography } from "@mui/material";
import { Link } from "@tanstack/react-router";
import { DEFAULT_REVIEW_SORT } from "../../../constants/reviews";
import { COURSE_CARD_MIN_HEIGHT, courseCardCodeSx } from "./courseCard.styles";

interface CourseCardSkeletonProps {
	code?: string;
	title?: string;
}

export function CourseCardSkeleton({ code, title }: CourseCardSkeletonProps) {
	const hasCourseLayout = Boolean(code && title);
	const content = (
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
							<Typography
								variant="overline"
								color="primary"
								sx={courseCardCodeSx}
							>
								{code}
							</Typography>
							<CourseCardTitle title={title!} />
						</>
					) : (
						<>
							<Typography
								variant="overline"
								sx={{ ...courseCardCodeSx, position: "relative" }}
							>
								{/* Preserve the code's inline line box before it is known. */}
								<Box component="span" sx={{ visibility: "hidden" }}>
									CC0000
								</Box>
								<Skeleton
									variant="text"
									width={54}
									height="100%"
									sx={{ position: "absolute", top: 0, left: 0 }}
								/>
							</Typography>
							<Box sx={{ height: "2.375rem" }}>
								<Skeleton variant="text" width="88%" height="50%" />
								<Skeleton variant="text" width="58%" height="50%" />
							</Box>
						</>
					)}
				</Box>
			</Box>

			{/* Reserve the loaded footer without flashing placeholder statistics. */}
			<Box aria-hidden sx={{ height: 38, mt: "auto" }} />
		</CardContent>
	);

	return (
		<Card
			aria-hidden={hasCourseLayout ? undefined : true}
			sx={{
				height: "100%",
				minHeight: COURSE_CARD_MIN_HEIGHT,
				display: "flex",
				flexDirection: "column",
			}}
		>
			{hasCourseLayout ? (
				<Link
					to="/curso/$cursoId"
					params={{ cursoId: code! }}
					search={{ reviewSort: DEFAULT_REVIEW_SORT }}
					style={{
						textDecoration: "none",
						color: "inherit",
						display: "flex",
						flexGrow: 1,
					}}
				>
					{content}
				</Link>
			) : (
				content
			)}
		</Card>
	);
}
