import { createFileRoute, redirect } from "@tanstack/react-router";
import {
	useInfiniteQuery,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { useRef, useEffect } from "react";
import {
	Box,
	Typography,
	CircularProgress,
	Stack,
	Chip,
	Fade,
} from "@mui/material";
import {
	AdminPanelSettings as AdminIcon,
	Visibility as VisibleIcon,
	VisibilityOff as HiddenIcon,
} from "@mui/icons-material";
import { getAdminReviews, hideReview } from "../api/client";
import ReviewCard from "../components/ReviewCard";

export const Route = createFileRoute("/admin")({
	beforeLoad: () => {
		const stored = localStorage.getItem("ramitos-user");
		if (!stored) throw redirect({ to: "/" });
		try {
			const user = JSON.parse(stored);
			if (user.role !== "admin" && user.role !== "mod")
				throw redirect({ to: "/" });
		} catch {
			throw redirect({ to: "/" });
		}
	},
	component: AdminDashboard,
});

function AdminDashboard() {
	const qc = useQueryClient();
	const loadMoreRef = useRef<HTMLDivElement>(null);

	const reviewsQuery = useInfiniteQuery({
		queryKey: ["adminReviews"],
		queryFn: ({ pageParam }) => getAdminReviews(pageParam),
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (last) => last.nextCursor ?? undefined,
	});

	const hideMutation = useMutation({
		mutationFn: hideReview,
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["adminReviews"] });
		},
	});

	useEffect(() => {
		const el = loadMoreRef.current;
		if (!el) return;
		const observer = new IntersectionObserver(
			(entries) => {
				if (
					entries[0]?.isIntersecting &&
					reviewsQuery.hasNextPage &&
					!reviewsQuery.isFetchingNextPage
				) {
					reviewsQuery.fetchNextPage();
				}
			},
			{ threshold: 0.1 },
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, [
		reviewsQuery.hasNextPage,
		reviewsQuery.isFetchingNextPage,
		reviewsQuery.fetchNextPage,
	]);

	const allReviews = reviewsQuery.data?.pages.flatMap((p) => p.items) ?? [];
	const visibleCount = allReviews.filter((r) => !r.hidden).length;
	const hiddenCount = allReviews.filter((r) => r.hidden).length;

	return (
		<Fade in>
			<Box>
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						gap: 1.5,
						mb: 1,
					}}
				>
					<AdminIcon color="primary" />
					<Typography
						variant="h3"
						sx={{
							fontWeight: 700,
						}}
					>
						Panel de Moderación
					</Typography>
				</Box>
				<Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
					Revisa y modera las opiniones publicadas en la plataforma.
				</Typography>

				<Stack direction="row" spacing={1} sx={{ mb: 3 }}>
					<Chip
						icon={<VisibleIcon />}
						label={`${visibleCount} visibles`}
						color="success"
						variant="outlined"
					/>
					<Chip
						icon={<HiddenIcon />}
						label={`${hiddenCount} ocultas`}
						color="error"
						variant="outlined"
					/>
				</Stack>

				{reviewsQuery.isLoading ? (
					<Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
						<CircularProgress />
					</Box>
				) : (
					<Stack spacing={2}>
						{allReviews.map((review) => (
							<ReviewCard
								key={review.id}
								review={review}
								showCourseName={review.courseName}
								onHide={(id) => hideMutation.mutate(id)}
							/>
						))}
					</Stack>
				)}

				<Box
					ref={loadMoreRef}
					sx={{
						height: 40,
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						mt: 2,
					}}
				>
					{reviewsQuery.isFetchingNextPage && <CircularProgress size={24} />}
				</Box>
			</Box>
		</Fade>
	);
}
