import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useGetCoursesStaticData } from "../../../generated/api/course/courseService";
import type { CourseFilters } from "../../../shared/types/domain";
import {
	filterCourseCatalog,
	getCourseCatalogPage,
	normalizeCourseCatalog,
} from "../api/courseCatalog.api";

export function useCourseCatalog(filters: CourseFilters) {
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

	const pagesQuery = useInfiniteQuery({
		queryKey: [
			"course-catalog",
			filters,
			filteredEntries.map((course) => course.id).join(","),
		],
		queryFn: ({ pageParam }) =>
			getCourseCatalogPage(filteredEntries, pageParam),
		initialPageParam: 0,
		getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
		enabled: indexQuery.isSuccess,
	});

	return {
		indexQuery,
		pagesQuery,
		filteredTotal: filteredEntries.length,
		categoryOptions: indexQuery.data?.categoryOptions ?? [],
	};
}
