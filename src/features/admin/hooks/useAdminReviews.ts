import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Ordering } from "../api/adminReviews.api";
import { getAdminReviewsPage } from "../api/adminReviews.api";

export function useAdminReviews() {
	const [pagination, setPagination] = useState({
		cursors: [undefined] as (number | undefined)[],
		pageSize: 15,
		createdOrder: Ordering.desc as Ordering,
	});
	const { cursors, pageSize, createdOrder } = pagination;
	const [hiddenOverrides, setHiddenOverrides] = useState<Set<number>>(
		new Set(),
	);
	const reviewsQuery = useQuery({
		queryKey: [
			"adminReviews",
			pageSize,
			createdOrder,
			cursors[cursors.length - 1],
		],
		queryFn: () =>
			getAdminReviewsPage(cursors[cursors.length - 1], pageSize, createdOrder),
	});
	const reviews = useMemo(
		() =>
			(reviewsQuery.data?.items ?? []).map((review) => ({
				...review,
				// TODO(backend): Replace local moderation state when moderation endpoints exist.
				hidden: hiddenOverrides.has(review.id) ? !review.hidden : review.hidden,
			})),
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
		reviews,
		reviewsQuery,
		toggleHidden,
		page: cursors.length,
		pageSize,
		createdOrder,
		hasNextPage:
			reviewsQuery.isSuccess && reviewsQuery.data.nextCursor !== null,
		nextPage: () => {
			const cursor = reviewsQuery.data?.nextCursor;
			if (reviewsQuery.isFetching || !reviewsQuery.isSuccess || cursor == null)
				return;
			setPagination((current) => ({
				...current,
				cursors: [...current.cursors, cursor],
			}));
		},
		previousPage: () =>
			setPagination((current) => ({
				...current,
				cursors:
					current.cursors.length > 1
						? current.cursors.slice(0, -1)
						: current.cursors,
			})),
		setPageSize: (value: number) =>
			setPagination((current) => ({
				...current,
				pageSize: value,
				cursors: [undefined],
			})),
		setCreatedOrder: (value: Ordering) =>
			setPagination((current) => ({
				...current,
				createdOrder: value,
				cursors: [undefined],
			})),
		hiddenCount: reviews.filter((review) => review.hidden).length,
		visibleCount: reviews.filter((review) => !review.hidden).length,
	};
}
