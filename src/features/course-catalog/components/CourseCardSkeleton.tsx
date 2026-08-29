import { Box, Card, CardContent, Skeleton, Typography } from "@mui/material";
import { Link } from "@tanstack/react-router";
import { DEFAULT_REVIEW_SORT } from "../../../constants/reviews";
import {
	COURSE_CARD_MIN_HEIGHT,
	courseCardCodeSx,
	courseCardOpinionSx,
	courseCardTitleSx,
} from "./courseCard.styles";
import { MiniRadarSkeleton } from "./MiniRadar";

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
							<Typography variant="body1" sx={courseCardTitleSx}>
								{title}
							</Typography>
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
					<Typography
						variant="caption"
						color="text.secondary"
						sx={{
							...courseCardOpinionSx,
							display: "inline-flex",
							alignItems: "baseline",
						}}
					>
						<Skeleton
							component="span"
							variant="text"
							width="1ch"
							height="1em"
							sx={{
								display: "inline-block",
								transform: "none",
								mr: "0.35ch",
							}}
						/>
						opiniones
					</Typography>
				) : (
					<Skeleton variant="text" width={72} height={16} />
				)}
				{hasCourseLayout ? (
					<MiniRadarSkeleton />
				) : (
					<Skeleton variant="circular" width={38} height={38} />
				)}
			</Box>
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
