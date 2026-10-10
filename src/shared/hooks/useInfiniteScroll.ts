import { useEffect, useRef } from "react";

export function useInfiniteScroll({
	hasNextPage,
	isFetchingNextPage,
	fetchNextPage,
}: {
	hasNextPage: boolean;
	isFetchingNextPage: boolean;
	fetchNextPage: () => Promise<unknown>;
}) {
	const target = useRef<HTMLDivElement>(null);
	useEffect(() => {
		const element = target.current;
		if (!element) return;
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
					// TanStack Query owns the error state rendered by the caller.
					void fetchNextPage().catch(() => undefined);
				}
			},
			{ threshold: 0.1 },
		);
		observer.observe(element);
		return () => observer.disconnect();
	}, [hasNextPage, isFetchingNextPage, fetchNextPage]);
	return target;
}
