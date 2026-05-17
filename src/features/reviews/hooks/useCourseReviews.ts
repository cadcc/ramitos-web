import { useEffect, useRef } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import type { ReviewSort } from "../../../shared/types/domain";
import {
	getCourseReviewsPage,
	getOwnCourseReview,
} from "../api/courseReviews.api";

export function useCourseReviews(cursoId: string, reviewSort: ReviewSort) {
	const loadMoreRef = useRef<HTMLDivElement>(null);
	const reviewsQuery = useInfiniteQuery({
		queryKey: ["reviews", cursoId, reviewSort],
		queryFn: ({ pageParam }) =>
			getCourseReviewsPage(cursoId, reviewSort, pageParam),
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

	return {
		reviewsQuery,
		loadMoreRef,
		reviews: reviewsQuery.data?.pages.flatMap((p) => p.items) ?? [],
		total: reviewsQuery.data?.pages[0]?.total ?? 0,
	};
}

export function useOwnCourseReview(
	cursoId: string,
	userId: number | undefined,
	enabled: boolean,
) {
	return useQuery({
		queryKey: ["ownReview", cursoId, userId],
		queryFn: () => getOwnCourseReview(cursoId, userId!),
		enabled: enabled && userId !== undefined,
	});
}
