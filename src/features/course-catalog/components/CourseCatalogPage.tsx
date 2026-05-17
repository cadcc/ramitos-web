import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { Box, CircularProgress, Fade, Grid, Typography } from "@mui/material";
import type { CourseFilters } from "../../../shared/types/domain";
import {
	filterLoadedCourseCatalog,
	getCourseCatalogPage,
	getLoadedCategoryTags,
} from "../api/courseCatalog.api";
import CourseCard from "./CourseCard";
import FilterBar from "./FilterBar";

interface CourseCatalogPageProps {
	filters: CourseFilters;
	onFilterChange: (filters: CourseFilters) => void;
}

export function CourseCatalogPage({
	filters,
	onFilterChange,
}: CourseCatalogPageProps) {
	const observerTarget = useRef<HTMLDivElement>(null);

	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading,
		isError,
	} = useInfiniteQuery({
		queryKey: ["courses", filters],
		queryFn: ({ pageParam }) => getCourseCatalogPage(pageParam),
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
	});

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

	const loadedCourses = data?.pages.flatMap((p) => p.items) ?? [];
	const allCourses = filterLoadedCourseCatalog(loadedCourses, filters);
	const categoryOptions = getLoadedCategoryTags(loadedCourses);
	const total = allCourses.length;

	return (
		<Box>
			<FilterBar
				filters={filters}
				onFilterChange={onFilterChange}
				categoryOptions={categoryOptions}
			/>

			{!isLoading && (
				<Fade in>
					<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
						{total} {total === 1 ? "curso cargado" : "cursos cargados"}
					</Typography>
				</Fade>
			)}

			{isLoading ? (
				<Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
					<CircularProgress />
				</Box>
			) : isError ? (
				<Box sx={{ textAlign: "center", py: 8 }}>
					<Typography color="error">
						Error al cargar los cursos. Intenta de nuevo.
					</Typography>
				</Box>
			) : allCourses.length === 0 ? (
				<Box sx={{ textAlign: "center", py: 8 }}>
					<Typography variant="h5">No se encontraron cursos</Typography>
					<Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
						Prueba ajustando los filtros o el termino de busqueda.
					</Typography>
				</Box>
			) : (
				<Grid container spacing={2}>
					{allCourses.map((course, i) => (
						<Grid size={{ xs: 12, sm: 6, md: 3 }} key={course.id}>
							<CourseCard course={course} index={i} />
						</Grid>
					))}
				</Grid>
			)}

			<Box
				ref={observerTarget}
				sx={{
					height: 60,
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
				}}
			>
				{isFetchingNextPage && <CircularProgress size={24} />}
			</Box>
		</Box>
	);
}
