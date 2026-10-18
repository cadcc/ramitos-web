import { useAuth } from "../../auth";
import { getReviewableCourses } from "../api/reviewableCourses.api";
import {
	useInfiniteQuery,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { useMemo } from "react";
import type { CourseFilters } from "../../../shared/types/domain";
import {
	COURSE_CATALOG_PAGE_SIZE,
	filterCourseCatalog,
	getCourseCatalogPage,
	getCourseCatalogIndex,
} from "../api/courseCatalog.api";

export function useCourseCatalog(filters: CourseFilters) {
	const queryClient = useQueryClient();
	const { user, isAuthenticated } = useAuth();
	const personalFilter = filters.reviewable !== undefined;
	const reviewableScope = filters.reviewable ?? true;
	const reviewableQuery = useQuery({
		queryKey: ["reviewable-courses", user?.id, reviewableScope],
		queryFn: () => getReviewableCourses(reviewableScope),
		enabled: isAuthenticated,
	});
	const reviewableCourseIds = useMemo(
		() =>
			new Set(
				isAuthenticated && filters.reviewable === undefined
					? reviewableQuery.data?.map((course) => course.id)
					: [],
			),
		[isAuthenticated, filters.reviewable, reviewableQuery.data],
	);
	const indexQuery = useQuery({
		queryKey: ["course-catalog-index"],
		queryFn: getCourseCatalogIndex,
		staleTime: Number.POSITIVE_INFINITY,
	});

	const filteredEntries = useMemo(() => {
		const entries = indexQuery.data?.items ?? [];
		const byId = new Map(entries.map((entry) => [entry.id, entry]));
		const source = personalFilter
			? (isAuthenticated ? (reviewableQuery.data ?? []) : []).map(
					(course) =>
						byId.get(course.id) ?? {
							id: course.id,
							name: course.name,
							categoryTags: [],
						},
				)
			: entries;
		return filterCourseCatalog(source, filters);
	}, [
		indexQuery.data?.items,
		filters,
		personalFilter,
		isAuthenticated,
		reviewableQuery.data,
	]);
	const entriesFingerprint = useMemo(
		() =>
			filteredEntries
				.map(
					(course) =>
						`${course.id}:${course.isPlaceholder ? "placeholder" : "available"}`,
				)
				.join(","),
		[filteredEntries],
	);
	const pageQueryOptions = (cursor: number) => ({
		queryKey: [
			"course-catalog-page",
			personalFilter ? user?.id : null,
			entriesFingerprint,
			cursor,
		] as const,
		queryFn: () =>
			getCourseCatalogPage(
				filteredEntries,
				cursor,
				personalFilter ? reviewableQuery.data : undefined,
			),
		staleTime: Number.POSITIVE_INFINITY,
	});

	const pagesQuery = useInfiniteQuery({
		queryKey: [
			"course-catalog",
			personalFilter ? user?.id : null,
			filters,
			entriesFingerprint,
		],
		queryFn: ({ pageParam }) =>
			queryClient.fetchQuery(pageQueryOptions(pageParam)),
		initialPageParam: 0,
		getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
		enabled:
			indexQuery.isSuccess &&
			(!personalFilter || (isAuthenticated && reviewableQuery.isSuccess)),
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
		enabled:
			nextCursor != null &&
			(!personalFilter || (isAuthenticated && reviewableQuery.isSuccess)),
	});

	return {
		reviewableCourseIds,
		reviewableQuery,
		requiresLogin: personalFilter && !isAuthenticated,
		indexQuery,
		pagesQuery,
		filteredTotal: filteredEntries.length,
		categoryOptions: indexQuery.data?.categoryOptions ?? [],
		initialSkeletonEntries,
		nextSkeletonEntries,
	};
}
