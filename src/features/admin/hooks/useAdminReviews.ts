import { useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getAdminReviewsPage } from "../api/adminReviews.api";

export function useAdminReviews() {
	const loadMoreRef = useRef<HTMLDivElement>(null);
	const [hiddenOverrides, setHiddenOverrides] = useState<Set<number>>(
		new Set(),
	);

	const reviewsQuery = useInfiniteQuery({
		queryKey: ["adminReviews"],
		queryFn: ({ pageParam }) => getAdminReviewsPage(pageParam),
		initialPageParam: undefined as number | undefined,
		getNextPageParam: (last) => last.nextCursor ?? undefined,
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

	const reviews = useMemo(
		() =>
			(reviewsQuery.data?.pages.flatMap((p) => p.items) ?? []).map(
				(review) => ({
					...review,
					// TODO(backend): Replace this local-only moderation state when review moderation endpoints exist.
					// TODO(backend): Once moderation endpoints exist, switch hide/show to the generated mutation hook.
					hidden: hiddenOverrides.has(review.id)
						? !review.hidden
						: review.hidden,
				}),
			),
		[hiddenOverrides, reviewsQuery.data],
	);

	const toggleHidden = (reviewId: number) => {
		setHiddenOverrides((current) => {
			const next = new Set(current);
			if (next.has(reviewId)) next.delete(reviewId);
			else next.add(reviewId);
			return next;
		});
	};

	return {
		loadMoreRef,
		reviews,
		reviewsQuery,
		toggleHidden,
		hiddenCount: reviews.filter((review) => review.hidden).length,
		visibleCount: reviews.filter((review) => !review.hidden).length,
	};
}
