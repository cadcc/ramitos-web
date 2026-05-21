import {
	Box,
	Button,
	IconButton,
	Stack,
	Tooltip,
	Typography,
} from "@mui/material";
import {
	DeleteSweep as ClearIcon,
	Edit as EditIcon,
	Settings as SettingsIcon,
} from "@mui/icons-material";
import { roadmapColors } from "../model/tokens";
import type { RoadmapMarkColor, RoadmapSettings } from "../model/types";
import { RoadmapSettingsMenu } from "./RoadmapSettingsMenu";

interface RoadmapToolbarProps {
	settings: RoadmapSettings;
	settingsAnchor: HTMLElement | null;
	editMode: boolean;
	editColor: RoadmapMarkColor;
	onSettingsClick: (anchor: HTMLElement) => void;
	onSettingsClose: () => void;
	onSettingChange: <K extends keyof RoadmapSettings>(
		key: K,
		value: RoadmapSettings[K],
	) => void;
	onEditModeChange: (enabled: boolean) => void;
	onEditColorChange: (color: RoadmapMarkColor) => void;
	onClearMarks: () => void;
}

export function RoadmapToolbar({
	settings,
	settingsAnchor,
	editMode,
	editColor,
	onSettingsClick,
	onSettingsClose,
	onSettingChange,
	onEditModeChange,
	onEditColorChange,
	onClearMarks,
}: RoadmapToolbarProps) {
	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: { xs: "column", md: "row" },
				alignItems: { xs: "stretch", md: "center" },
				gap: 1.5,
				mb: 2,
			}}
		>
			<Box sx={{ flex: 1 }}>
				<Typography variant="h4">Malla DCC</Typography>
				<Typography variant="body2" color="text.secondary">
					Explora requisitos, desbloqueos y tu avance en la carrera.
				</Typography>
			</Box>

			<Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
				<Tooltip title="Configurar visualizacion">
					<IconButton
						aria-label="Configurar malla"
						onClick={(event) => onSettingsClick(event.currentTarget)}
					>
						<SettingsIcon />
					</IconButton>
				</Tooltip>
				<Button
					aria-label="Marcar avance"
					variant={editMode ? "contained" : "outlined"}
					startIcon={<EditIcon />}
					onClick={() => onEditModeChange(!editMode)}
				>
					Marcar
				</Button>
				{editMode && (
					<Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
						{([1, 2, 3, 4] as RoadmapMarkColor[]).map((color) => (
							<Box
								key={color}
								role="button"
								tabIndex={0}
								aria-label={`Color ${color}`}
								onClick={() => onEditColorChange(color)}
								onKeyDown={(event) => {
									if (event.key === "Enter" || event.key === " ") {
										event.preventDefault();
										onEditColorChange(color);
									}
								}}
								sx={{
									width: 28,
									height: 28,
									borderRadius: "50%",
									bgcolor: roadmapColors.marks[color],
									border: 2,
									borderColor: editColor === color ? "text.primary" : "divider",
									cursor: "pointer",
								}}
							/>
						))}
						<Tooltip title="Des-marcar todos los cursos">
							<IconButton
								aria-label="Des-marcar todos los cursos"
								onClick={onClearMarks}
							>
								<ClearIcon />
							</IconButton>
						</Tooltip>
					</Stack>
				)}
			</Stack>

			<RoadmapSettingsMenu
				anchorEl={settingsAnchor}
				settings={settings}
				onClose={onSettingsClose}
				onSettingChange={onSettingChange}
			/>
		</Box>
	);
}
