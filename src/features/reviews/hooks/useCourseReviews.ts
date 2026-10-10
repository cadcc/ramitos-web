import { useInfiniteScroll } from "../../../shared/hooks/useInfiniteScroll";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import type { ReviewSort } from "../../../shared/types/domain";
import {
	getCourseReviewsPage,
	getOwnCourseReview,
} from "../api/courseReviews.api";

export function useCourseReviews(cursoId: string, reviewSort: ReviewSort) {
	const reviewsQuery = useInfiniteQuery({
		queryKey: ["reviews", cursoId, reviewSort],
		queryFn: ({ pageParam }) =>
			getCourseReviewsPage(cursoId, reviewSort, pageParam),
		initialPageParam: undefined as number | undefined,
		getNextPageParam: (last) => last.nextCursor ?? undefined,
	});

	const loadMoreRef = useInfiniteScroll(reviewsQuery);

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
