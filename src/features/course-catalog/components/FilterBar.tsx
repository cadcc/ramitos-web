import { useState, useEffect } from "react";
import {
	Box,
	TextField,
	InputAdornment,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	IconButton,
	Chip,
	ToggleButton,
	ToggleButtonGroup,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import type { CourseFilters, SortOption } from "../../../shared/types/domain";
import { COURSE_CATEGORIES } from "../courseCategories";
import type { CourseCategory } from "../../../shared/types/domain";
import CategoryIcon from "../../../shared/components/CategoryIcon";
import { AcmTaxonomyFilter } from "./AcmTaxonomyFilter";
import { usePreviewFeatures } from "../../../shared/hooks/usePreviewFeatures";

const sortOptions: {
	value: SortOption;
	label: string;
	implemented: boolean;
}[] = [
	{ value: "reviews", label: "Más opiniones", implemented: false },
	{ value: "rating", label: "Mejor evaluado", implemented: false },
	{ value: "recent", label: "Reciente", implemented: false },
	{ value: "alphabetical", label: "A-Z", implemented: true },
	{ value: "code", label: "Código", implemented: true },
];

const implementedSorts = new Set<SortOption>(["alphabetical", "code"]);

interface Props {
	filters: CourseFilters;
	onFilterChange: (filters: CourseFilters) => void;
	categoryOptions?: string[];
}

export default function FilterBar({
	filters,
	onFilterChange,
	categoryOptions = [],
}: Props) {
	const { features } = usePreviewFeatures();
	const [draft, setDraft] = useState({
		source: filters.q,
		text: filters.q ?? "",
	});
	// Adjust the draft when URL navigation changes the source query.
	if (draft.source !== filters.q) {
		setDraft({ source: filters.q, text: filters.q ?? "" });
	}
	// Typing keeps a local debounced value.
	const searchText =
		draft.source === filters.q ? draft.text : (filters.q ?? "");
	const setSearchText = (text: string) => setDraft({ source: filters.q, text });
	const selectedSort =
		filters.sort && implementedSorts.has(filters.sort) ? filters.sort : "code";

	useEffect(() => {
		if (searchText === (filters.q ?? "")) return;
		const timer = setTimeout(() => {
			onFilterChange({ ...filters, q: searchText || undefined });
		}, 350);
		return () => clearTimeout(timer);
	}, [searchText, filters, onFilterChange]);

	const activeFilterCount =
		(features.acmCategories && filters.acmArea ? 1 : 0) +
		(filters.plan ? 1 : 0) +
		(filters.currentlyOffered ? 1 : 0) +
		(features.categories && filters.tags && filters.tags.length > 0 ? 1 : 0) +
		(filters.modernOnly === false ? 1 : 0);

	return (
		<Box sx={{ mb: 2 }}>
			{/* Keep the toolbar on one row; narrow screens can scroll it. */}
			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: {
						xs: "minmax(140px, 1fr) 110px auto",
						sm: "minmax(140px, 1fr) 130px auto",
					},
					overflowX: "auto",
					py: 1,
					gap: 1,
					alignItems: "center",
				}}
			>
				<TextField
					placeholder="Buscar ramo por código o nombre..."
					size="small"
					value={searchText}
					onChange={(e) => setSearchText(e.target.value)}
					sx={{
						minWidth: 0,
						"& .MuiOutlinedInput-root": {
							borderRadius: 2,
							bgcolor: "background.paper",
							fontSize: "0.85rem",
						},
					}}
					slotProps={{
						htmlInput: { "aria-label": "Buscar curso" },
						input: {
							startAdornment: (
								<InputAdornment position="start">
									<SearchIcon sx={{ fontSize: 18, color: "text.secondary" }} />
								</InputAdornment>
							),
							endAdornment: searchText ? (
								<InputAdornment position="end">
									<IconButton
										aria-label="Limpiar búsqueda"
										size="small"
										onClick={() => setSearchText("")}
									>
										<CloseIcon sx={{ fontSize: 14 }} />
									</IconButton>
								</InputAdornment>
							) : null,
						},
					}}
				/>

				<FormControl size="small" sx={{ minWidth: { xs: 0, sm: 130 } }}>
					<InputLabel sx={{ fontSize: "0.85rem" }}>Ordenar</InputLabel>
					<Select
						value={selectedSort}
						label="Ordenar"
						onChange={(e) =>
							onFilterChange({ ...filters, sort: e.target.value })
						}
						sx={{
							bgcolor: "background.paper",
							borderRadius: 2,
							fontSize: "0.85rem",
						}}
					>
						{sortOptions.map((o) => (
							<MenuItem key={o.value} value={o.value} disabled={!o.implemented}>
								{o.label}
							</MenuItem>
						))}
					</Select>
				</FormControl>

				<FormControl size="small" sx={{ minWidth: 130 }}>
					<InputLabel id="course-scope-label" sx={{ fontSize: "0.85rem" }}>
						Ramos
					</InputLabel>
					<Select
						labelId="course-scope-label"
						label="Ramos"
						value={
							filters.reviewable === undefined
								? "all"
								: filters.reviewable
									? "mine"
									: "other"
						}
						onChange={(event) =>
							onFilterChange({
								...filters,
								reviewable:
									event.target.value === "all"
										? undefined
										: event.target.value === "mine",
							})
						}
						sx={{
							bgcolor: "background.paper",
							borderRadius: 2,
							fontSize: "0.85rem",
						}}
					>
						<MenuItem value="all">Todos</MenuItem>
						<MenuItem value="mine">Cursados</MenuItem>
						<MenuItem value="other">No cursados</MenuItem>
					</Select>
				</FormControl>
			</Box>

			{/* Always-visible compact filter row */}
			<Box
				sx={{
					display: "flex",
					gap: 0.75,
					flexWrap: "wrap",
					justifyContent: "center",
					alignItems: "center",
					mt: 0.5,
				}}
			>
				<ToggleButtonGroup
					exclusive
					value={filters.category ?? "dcc"}
					onChange={(_, value: CourseCategory | null) => {
						if (value) onFilterChange({ ...filters, category: value });
					}}
					aria-label="Tipo de ramo"
					size="small"
					sx={{
						flexWrap: "wrap",
						justifyContent: "center",
						gap: 0.5,
						"& .MuiToggleButtonGroup-grouped": {
							m: 0,
							border: "1px solid",
							borderColor: "divider",
							borderRadius: "999px !important",
							px: 1.5,
							py: 0.5,
							minHeight: 32,
							textTransform: "none",
							fontSize: "0.75rem",
							lineHeight: 1.2,
							whiteSpace: "nowrap",
						},
						"& .MuiToggleButton-root.Mui-selected": {
							bgcolor: "primary.main",
							color: "primary.contrastText",
							borderColor: "primary.main",
							"&:hover": { bgcolor: "primary.dark" },
						},
					}}
				>
					{COURSE_CATEGORIES.map((category) => (
						<ToggleButton key={category.value} value={category.value}>
							{category.label}
						</ToggleButton>
					))}
				</ToggleButtonGroup>

				{features.categories && (
					<FormControl
						size="small"
						sx={{ width: { xs: "100%", sm: 280 }, minWidth: 0 }}
						disabled={categoryOptions.length === 0}
					>
						<InputLabel id="course-category-label" sx={{ fontSize: "0.8rem" }}>
							Categoría
						</InputLabel>
						<Select
							labelId="course-category-label"
							value={filters.tags?.[0] ?? ""}
							label="Categoría"
							MenuProps={{
								slotProps: {
									paper: { sx: { maxHeight: 360, maxWidth: "100%" } },
								},
							}}
							onChange={(e) => {
								const val = e.target.value;
								onFilterChange({
									...filters,
									tags: val ? [val] : undefined,
								});
							}}
							sx={{
								bgcolor: "background.paper",
								borderRadius: 2,
								fontSize: "0.8rem",
								height: 32,
							}}
						>
							<MenuItem value="">Todas</MenuItem>
							{categoryOptions.map((tag) => (
								<MenuItem
									key={tag}
									value={tag}
									sx={{
										fontSize: "0.85rem",
										display: "flex",
										alignItems: "center",
										gap: 1,
										whiteSpace: "normal",
									}}
								>
									<CategoryIcon
										category={tag}
										sx={{ fontSize: 16, color: "text.secondary" }}
									/>
									{tag}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				)}

				{features.acmCategories && (
					<AcmTaxonomyFilter
						value={filters.acmArea}
						onChange={(acmArea) => onFilterChange({ ...filters, acmArea })}
					/>
				)}

				{activeFilterCount > 0 && (
					<Chip
						label="Limpiar"
						onDelete={() =>
							onFilterChange({
								q: filters.q,
								category: filters.category,
								reviewable: filters.reviewable,
								sort: selectedSort,
								modernOnly: true,
							})
						}
						size="small"
						variant="outlined"
						sx={{ fontSize: "0.7rem", height: 24 }}
					/>
				)}
			</Box>
		</Box>
	);
}
