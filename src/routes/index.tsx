import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useRef, useEffect, useCallback } from "react";
import { z } from "zod";
import { Box, Grid, Typography, CircularProgress, Fade } from "@mui/material";
import {
	filterLoadedCourseCatalog,
	getCourseCatalogPage,
	getLoadedCategoryTags,
} from "../api/courseCatalog";
import type { CourseFilters } from "../api/types";
import CourseCard from "../components/CourseCard";
import FilterBar from "../components/FilterBar";

const searchSchema = z.object({
	q: z.string().optional(),
	sort: z
		.enum(["rating", "reviews", "recent", "alphabetical", "code"])
		.optional(),
	plan: z
		.enum(["obligatorio", "electivo_licenciatura", "electivo_especialidad"])
		.optional(),
	tags: z.array(z.string()).optional(),
	currentlyOffered: z.boolean().optional(),
	semester: z.string().optional(),
});

export const Route = createFileRoute("/")({
	validateSearch: searchSchema,
	component: HomePage,
});

function HomePage() {
	const search = Route.useSearch();
	const navigate = useNavigate({ from: "/" });
	const observerTarget = useRef<HTMLDivElement>(null);

	const filters: CourseFilters = {
		q: search.q,
		sort: search.sort,
		plan: search.plan,
		tags: search.tags,
		currentlyOffered: search.currentlyOffered,
		semester: search.semester,
	};

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

	const handleFilterChange = useCallback(
		(newFilters: CourseFilters) => {
			navigate({
				search: {
					q: newFilters.q,
					sort: newFilters.sort,
					plan: newFilters.plan,
					tags: newFilters.tags,
					currentlyOffered: newFilters.currentlyOffered,
					semester: newFilters.semester,
				},
				replace: true,
			});
		},
		[navigate],
	);

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
				onFilterChange={handleFilterChange}
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
						Prueba ajustando los filtros o el término de búsqueda.
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
