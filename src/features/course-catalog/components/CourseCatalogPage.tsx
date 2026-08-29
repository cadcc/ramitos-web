import { useEffect, useRef } from "react";
import { Box, Fade, Grid, Skeleton, Typography } from "@mui/material";
import type { CourseFilters } from "../../../shared/types/domain";
import type { CourseCatalogEntry } from "../api/courseCatalog.api";
import { COURSE_CATALOG_PAGE_SIZE } from "../api/courseCatalog.api";
import { useCourseCatalog } from "../hooks/useCourseCatalog";
import CourseCard from "./CourseCard";
import { CourseCardSkeleton } from "./CourseCardSkeleton";
import FilterBar from "./FilterBar";

interface CourseCatalogPageProps {
	filters: CourseFilters;
	onFilterChange: (filters: CourseFilters) => void;
}

interface CourseSkeletonGridProps {
	entries?: CourseCatalogEntry[];
	fallbackCount?: number;
}

function CourseSkeletonGrid({
	entries,
	fallbackCount = COURSE_CATALOG_PAGE_SIZE,
}: CourseSkeletonGridProps) {
	const skeletons = entries ?? Array.from({ length: fallbackCount });

	return (
		<Grid container spacing={2} aria-label="Cargando cursos">
			{skeletons.map((entry, index) => (
				<Grid size={{ xs: 12, sm: 6, md: 3 }} key={entry?.id ?? index}>
					<CourseCardSkeleton code={entry?.id} title={entry?.name} />
				</Grid>
			))}
		</Grid>
	);
}

export function CourseCatalogPage({
	filters,
	onFilterChange,
}: CourseCatalogPageProps) {
	const observerTarget = useRef<HTMLDivElement>(null);

	const {
		indexQuery,
		pagesQuery,
		filteredTotal,
		categoryOptions,
		initialSkeletonEntries,
		nextSkeletonEntries,
	} = useCourseCatalog(filters);
	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading,
		isError,
	} = pagesQuery;

	useEffect(() => {
		const el = observerTarget.current;
		if (!el) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
					fetchNextPage();
				}
			},
			{ threshold: 0.1 },
		);

		observer.observe(el);
		return () => observer.disconnect();
	}, [hasNextPage, isFetchingNextPage, fetchNextPage]);

	const courses = data?.pages.flatMap((page) => page.items) ?? [];
	const loading = indexQuery.isLoading || isLoading;
	const error = indexQuery.isError || isError;

	return (
		<Box>
			<FilterBar
				filters={filters}
				onFilterChange={onFilterChange}
				categoryOptions={categoryOptions}
			/>

			{indexQuery.isSuccess && !error && (
				<Fade in>
					<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
						{filteredTotal} {filteredTotal === 1 ? "curso" : "cursos"}
					</Typography>
				</Fade>
			)}
			{indexQuery.isLoading && (
				<Skeleton width={86} height={20} sx={{ mb: 2 }} />
			)}

			{loading ? (
				<CourseSkeletonGrid
					entries={indexQuery.isSuccess ? initialSkeletonEntries : undefined}
				/>
			) : error ? (
				<Box sx={{ textAlign: "center", py: 8 }}>
					<Typography color="error">
						Error al cargar los cursos. Intenta de nuevo.
					</Typography>
				</Box>
			) : courses.length === 0 ? (
				<Box sx={{ textAlign: "center", py: 8 }}>
					<Typography variant="h5">No se encontraron cursos</Typography>
					<Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
						Prueba ajustando los filtros o el termino de busqueda.
					</Typography>
				</Box>
			) : (
				<Grid container spacing={2}>
					{courses.map((course, index) => (
						<Grid size={{ xs: 12, sm: 6, md: 3 }} key={course.id}>
							<CourseCard course={course} index={index} />
						</Grid>
					))}
				</Grid>
			)}

			{!loading && !error && hasNextPage && (
				<Box ref={observerTarget} sx={{ mt: 2 }}>
					<CourseSkeletonGrid entries={nextSkeletonEntries} />
				</Box>
			)}
		</Box>
	);
}
