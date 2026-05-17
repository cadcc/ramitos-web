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
} from "@mui/material";
import {
	Search as SearchIcon,
	Close as CloseIcon,
	Tune as TuneIcon,
} from "@mui/icons-material";
import type { CourseFilters, SortOption } from "../../../shared/types/domain";
import CategoryIcon from "../../../shared/components/CategoryIcon";

const sortOptions: { value: SortOption; label: string }[] = [
	{ value: "reviews", label: "Más opiniones" },
	{ value: "rating", label: "Mejor evaluado" },
	{ value: "recent", label: "Reciente" },
	{ value: "alphabetical", label: "A-Z" },
	{ value: "code", label: "Código" },
];

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
	const [searchText, setSearchText] = useState(filters.q ?? "");
	const [filtersOpen, setFiltersOpen] = useState(false);

	useEffect(() => {
		const timer = setTimeout(() => {
			onFilterChange({ ...filters, q: searchText || undefined });
		}, 350);
		return () => clearTimeout(timer);
	}, [searchText]);

	const activeFilterCount =
		(filters.plan ? 1 : 0) +
		(filters.currentlyOffered ? 1 : 0) +
		(filters.tags && filters.tags.length > 0 ? 1 : 0);

	return (
		<Box sx={{ mb: 2 }}>
			{/* Top row: search + sort + filter toggle */}
			<Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
				<TextField
					placeholder="Buscar curso..."
					size="small"
					value={searchText}
					onChange={(e) => setSearchText(e.target.value)}
					sx={{
						flex: 1,
						"& .MuiOutlinedInput-root": {
							borderRadius: 2,
							bgcolor: "background.paper",
							fontSize: "0.85rem",
						},
					}}
					slotProps={{
						input: {
							startAdornment: (
								<InputAdornment position="start">
									<SearchIcon sx={{ fontSize: 18, color: "text.secondary" }} />
								</InputAdornment>
							),
							endAdornment: searchText ? (
								<InputAdornment position="end">
									<IconButton size="small" onClick={() => setSearchText("")}>
										<CloseIcon sx={{ fontSize: 14 }} />
									</IconButton>
								</InputAdornment>
							) : null,
						},
					}}
				/>

				<FormControl size="small" sx={{ minWidth: 130 }}>
					<InputLabel sx={{ fontSize: "0.85rem" }}>Ordenar</InputLabel>
					<Select
						value={filters.sort ?? "reviews"}
						label="Ordenar"
						onChange={(e) =>
							onFilterChange({ ...filters, sort: e.target.value as SortOption })
						}
						sx={{
							bgcolor: "background.paper",
							borderRadius: 2,
							fontSize: "0.85rem",
						}}
					>
						{sortOptions.map((o) => (
							<MenuItem key={o.value} value={o.value}>
								{o.label}
							</MenuItem>
						))}
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
						justifyContent: "center",
						alignItems: "center",
						mt: 1.5,
					}}
				>
					<ToggleButtonGroup
						value={filters.plan ?? null}
						exclusive
						onChange={(_, val) =>
							onFilterChange({ ...filters, plan: val ?? undefined })
						}
						size="small"
						sx={{
							"& .MuiToggleButton-root": {
								textTransform: "none",
								fontSize: "0.75rem",
								px: 1.5,
								py: 0.4,
								borderColor: "divider",
							},
						}}
					>
						{planOptions.map((o) => (
							<ToggleButton key={o.value} value={o.value}>
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
							"& .MuiToggleButton-root": {
								textTransform: "none",
								fontSize: "0.75rem",
								px: 1.5,
								py: 0.4,
								borderColor: "divider",
							},
						}}
					>
						<ToggleButton value="yes">Dictándose</ToggleButton>
					</ToggleButtonGroup>

					<FormControl size="small" sx={{ minWidth: 120 }}>
						<InputLabel sx={{ fontSize: "0.8rem" }}>Categoría</InputLabel>
						<Select
							value={filters.tags?.[0] ?? ""}
							label="Categoría"
							onChange={(e) => {
								const val = e.target.value as string;
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
								onFilterChange({ q: filters.q, sort: filters.sort })
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
