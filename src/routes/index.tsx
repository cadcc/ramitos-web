import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";
import { z } from "zod";
import type { CourseFilters } from "../shared/types/domain";
import { CourseCatalogPage } from "../features/course-catalog";

const searchSchema = z.object({
	q: z.string().optional(),
	sort: z
		.enum(["rating", "reviews", "recent", "alphabetical", "code"])
		.optional(),
	modernOnly: z.boolean().optional(),
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
	const supportedSort =
		search.sort === "alphabetical" || search.sort === "code"
			? search.sort
			: "code";

	const filters: CourseFilters = {
		q: search.q,
		sort: supportedSort,
		modernOnly: search.modernOnly ?? true,
		plan: search.plan,
		tags: search.tags,
		currentlyOffered: search.currentlyOffered,
		semester: search.semester,
	};

	const handleFilterChange = useCallback(
		(newFilters: CourseFilters) => {
			navigate({
				search: {
					q: newFilters.q,
					sort: newFilters.sort,
					modernOnly: newFilters.modernOnly === false ? false : undefined,
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

	return (
		<CourseCatalogPage filters={filters} onFilterChange={handleFilterChange} />
	);
}
