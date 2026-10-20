import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";
import { z } from "zod";
import type { CourseFilters } from "../shared/types/domain";
import { CourseCatalogPage } from "../features/course-catalog";
import { ACM_NODE_IDS } from "../constants/acmTaxonomy";

const searchSchema = z.object({
	acmArea: z.enum(ACM_NODE_IDS).optional(),
	category: z
		.enum([
			"dcc",
			"required",
			"specialization",
			"bachelor",
			"management",
			"integral",
		])
		.optional(),
	reviewable: z.boolean().optional(),
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
		acmArea: search.acmArea,
		category: search.category,
		reviewable: search.reviewable,
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
			void navigate({
				search: {
					acmArea: newFilters.acmArea,
					q: newFilters.q,
					category: newFilters.category,
					reviewable: newFilters.reviewable,
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
