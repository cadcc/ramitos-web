import { useState, useEffect } from "react";
import {
	Box,
	TextField,
	InputAdornment,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	ToggleButton,
	ToggleButtonGroup,
	IconButton,
	Chip,
	Button,
	Collapse,
	Badge,
	FormControlLabel,
	Switch,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import TuneIcon from "@mui/icons-material/Tune";
import type { CourseFilters, SortOption } from "../../../shared/types/domain";
import CategoryIcon from "../../../shared/components/CategoryIcon";

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

const planOptions = [
	{ value: "obligatorio", label: "Obligatorio" },
	{ value: "electivo_licenciatura", label: "Electivo Licenciatura" },
	{ value: "electivo_especialidad", label: "Electivo Especialidad" },
];

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
	const [filtersOpen, setFiltersOpen] = useState(false);
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
		(filters.plan ? 1 : 0) +
		(filters.currentlyOffered ? 1 : 0) +
		(filters.tags && filters.tags.length > 0 ? 1 : 0) +
		(filters.modernOnly === false ? 1 : 0);

	return (
		<Box sx={{ mb: 2 }}>
			{/* Keep the toolbar on one row; narrow screens can scroll it. */}
			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: {
						xs: "minmax(140px, 1fr) 110px auto auto",
						sm: "minmax(140px, 1fr) 130px auto auto",
					},
					overflowX: "auto",
					py: 1,
					gap: 1,
					alignItems: "center",
				}}
			>
				<TextField
					placeholder="Buscar curso..."
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

				<Badge
					badgeContent={activeFilterCount}
					color="primary"
					variant="dot"
					invisible={activeFilterCount === 0}
				>
					<Button
						size="small"
						variant={filtersOpen ? "contained" : "outlined"}
						startIcon={<TuneIcon sx={{ fontSize: 16 }} />}
						onClick={() => setFiltersOpen(!filtersOpen)}
						sx={{
							textTransform: "none",
							fontSize: "0.8rem",
							borderColor: "divider",
							minWidth: 90,
							minHeight: 40,
						}}
					>
						Filtros
					</Button>
				</Badge>
			</Box>

			{/* Collapsible filter options */}
			<Collapse in={filtersOpen}>
				<Box
					sx={{
						display: "flex",
						gap: 0.75,
						flexWrap: "wrap",
						justifyContent: { xs: "stretch", sm: "center" },
						alignItems: "center",
						mt: 1.5,
					}}
				>
					<ToggleButtonGroup
						value={filters.plan ?? null}
						exclusive
						onChange={(_, val: CourseFilters["plan"] | null) =>
							onFilterChange({ ...filters, plan: val ?? undefined })
						}
						size="small"
						sx={{
							width: { xs: "100%", sm: "auto" },
							"& .MuiToggleButton-root": {
								flex: { xs: 1, sm: "initial" },
								textTransform: "none",
								fontSize: { xs: "0.68rem", sm: "0.75rem" },
								lineHeight: 1.2,
								px: { xs: 0.75, sm: 1.5 },
								py: 0.4,
								minHeight: 40,
								borderColor: "divider",
							},
						}}
					>
						{planOptions.map((o) => (
							<ToggleButton key={o.value} value={o.value} disabled>
								{o.label}
							</ToggleButton>
						))}
					</ToggleButtonGroup>

					<ToggleButtonGroup
						value={
							filters.currentlyOffered === undefined
								? null
								: filters.currentlyOffered
									? "yes"
									: null
						}
						exclusive
						onChange={(_, val) =>
							onFilterChange({
								...filters,
								currentlyOffered: val === "yes" ? true : undefined,
							})
						}
						size="small"
						sx={{
							width: { xs: "100%", sm: "auto" },
							"& .MuiToggleButton-root": {
								width: { xs: "100%", sm: "auto" },
								textTransform: "none",
								fontSize: "0.75rem",
								px: 1.5,
								py: 0.4,
								minHeight: 40,
								borderColor: "divider",
							},
						}}
					>
						<ToggleButton value="yes" disabled>
							Dictándose
						</ToggleButton>
					</ToggleButtonGroup>

					<FormControlLabel
						control={
							<Switch
								size="small"
								checked={filters.modernOnly !== false}
								onChange={(event) =>
									onFilterChange({
										...filters,
										modernOnly: event.target.checked,
									})
								}
							/>
						}
						label="Modernos"
						sx={{
							m: 0,
							"& .MuiFormControlLabel-label": { fontSize: "0.8rem" },
						}}
					/>

					<FormControl
						size="small"
						sx={{ minWidth: 120, width: { xs: "100%", sm: "auto" } }}
						disabled={categoryOptions.length === 0}
					>
						<InputLabel sx={{ fontSize: "0.8rem" }}>Categoría</InputLabel>
						<Select
							value={filters.tags?.[0] ?? ""}
							label="Categoría"
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

					{activeFilterCount > 0 && (
						<Chip
							label="Limpiar"
							onDelete={() =>
								onFilterChange({
									q: filters.q,
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
			</Collapse>
		</Box>
	);
}
