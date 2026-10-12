import { useInfiniteScroll } from "../../../shared/hooks/useInfiniteScroll";
import { useEffect } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import type { ReviewSort } from "../../../shared/types/domain";
import {
	getCourseReviewsPage,
	getOwnCourseReview,
} from "../api/courseReviews.api";

export function useCourseReviews(
	cursoId: string,
	reviewSort: ReviewSort,
	reviewId?: number,
) {
	const reviewsQuery = useInfiniteQuery({
		queryKey: ["reviews", cursoId, reviewSort],
		queryFn: ({ pageParam }) =>
			getCourseReviewsPage(cursoId, reviewSort, pageParam),
		initialPageParam: undefined as number | undefined,
		getNextPageParam: (last) => last.nextCursor ?? undefined,
	});

	const reviews = reviewsQuery.data?.pages.flatMap((p) => p.items) ?? [];
	const targetFound = reviews.some((review) => review.id === reviewId);
	const { hasNextPage, isFetching, isError, fetchNextPage } = reviewsQuery;
	useEffect(() => {
		if (
			reviewId !== undefined &&
			!targetFound &&
			hasNextPage &&
			!isFetching &&
			!isError
		) {
			void fetchNextPage().catch(() => undefined);
		}
	}, [reviewId, targetFound, hasNextPage, isFetching, isError, fetchNextPage]);
	const loadMoreRef = useInfiniteScroll({
		...reviewsQuery,
		hasNextPage: hasNextPage && !isError,
	});

	return {
		reviewsQuery,
		loadMoreRef,
		reviews,
		targetFound,
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
