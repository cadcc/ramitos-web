import {
	useInfiniteQuery,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { useGetCoursesStaticData } from "../../../generated/api/course/courseService";
import type { CourseFilters } from "../../../shared/types/domain";
import {
	COURSE_CATALOG_PAGE_SIZE,
	filterCourseCatalog,
	getCourseCatalogPage,
	normalizeCourseCatalog,
} from "../api/courseCatalog.api";

export function useCourseCatalog(filters: CourseFilters) {
	const queryClient = useQueryClient();
	const indexQuery = useGetCoursesStaticData({
		query: {
			select: (response) => normalizeCourseCatalog(response.data),
			staleTime: Number.POSITIVE_INFINITY,
		},
	});

	const filteredEntries = useMemo(
		() => filterCourseCatalog(indexQuery.data?.items ?? [], filters),
		[indexQuery.data?.items, filters],
	);
	const entriesFingerprint = useMemo(
		() => filteredEntries.map((course) => course.id).join(","),
		[filteredEntries],
	);
	const pageQueryOptions = (cursor: number) => ({
		queryKey: ["course-catalog-page", entriesFingerprint, cursor] as const,
		queryFn: () => getCourseCatalogPage(filteredEntries, cursor),
		staleTime: Number.POSITIVE_INFINITY,
	});

	const pagesQuery = useInfiniteQuery({
		queryKey: ["course-catalog", filters, entriesFingerprint],
		queryFn: ({ pageParam }) =>
			queryClient.fetchQuery(pageQueryOptions(pageParam)),
		initialPageParam: 0,
		getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
		enabled: indexQuery.isSuccess,
	});
	const loadedPages = pagesQuery.data?.pages;
	const nextCursor = loadedPages?.[loadedPages.length - 1]?.nextCursor;
	const initialSkeletonEntries = filteredEntries.slice(
		0,
		COURSE_CATALOG_PAGE_SIZE,
	);
	const nextSkeletonEntries =
		nextCursor == null
			? []
			: filteredEntries.slice(
					nextCursor,
					nextCursor + COURSE_CATALOG_PAGE_SIZE,
				);

	useQuery({
		...pageQueryOptions(nextCursor ?? 0),
		enabled: nextCursor != null,
	});

	return {
		indexQuery,
		pagesQuery,
		filteredTotal: filteredEntries.length,
		categoryOptions: indexQuery.data?.categoryOptions ?? [],
		initialSkeletonEntries,
		nextSkeletonEntries,
	};
}
