import {
	Box,
	Divider,
	Popover,
	Stack,
	Switch,
	TextField,
	Typography,
} from "@mui/material";
import type { RoadmapSettings } from "../model/types";

interface RoadmapSettingsMenuProps {
	anchorEl: HTMLElement | null;
	settings: RoadmapSettings;
	onClose: () => void;
	onSettingChange: <K extends keyof RoadmapSettings>(
		key: K,
		value: RoadmapSettings[K],
	) => void;
}

export function RoadmapSettingsMenu({
	anchorEl,
	settings,
	onClose,
	onSettingChange,
}: RoadmapSettingsMenuProps) {
	return (
		<Popover
			open={Boolean(anchorEl)}
			anchorEl={anchorEl}
			onClose={onClose}
			anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
			transformOrigin={{ vertical: "top", horizontal: "right" }}
			slotProps={{ paper: { sx: { p: 2, width: 320 } } }}
		>
			<Stack spacing={1.5}>
				<Typography variant="h6">Configuracion</Typography>
				<DepthControl
					label="Profundidad requisitos"
					value={settings.depthpre}
					onChange={(value) => onSettingChange("depthpre", value)}
				/>
				<DepthControl
					label="Profundidad desbloqueos"
					value={settings.depthpost}
					onChange={(value) => onSettingChange("depthpost", value)}
				/>
				<Divider />
				<SettingSwitch
					label="Mostrar lineas"
					checked={settings.showLines}
					onChange={(value) => onSettingChange("showLines", value)}
				/>
				<SettingSwitch
					label="Mostrar cursos de 0 creditos"
					checked={settings.showZeros}
					onChange={(value) => onSettingChange("showZeros", value)}
				/>
				<SettingSwitch
					label="Agrupar electivos"
					checked={settings.showCompacts}
					onChange={(value) => onSettingChange("showCompacts", value)}
				/>
				<SettingSwitch
					label="Mostrar etapas"
					checked={settings.showPhases}
					onChange={(value) => onSettingChange("showPhases", value)}
				/>
			</Stack>
		</Popover>
	);
}

function DepthControl({
	label,
	value,
	onChange,
}: {
	label: string;
	value: number;
	onChange: (value: number) => void;
}) {
	return (
		<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
			<Typography sx={{ flex: 1, fontSize: "0.88rem" }}>{label}</Typography>
			<TextField
				value={value}
				type="number"
				size="small"
				onChange={(event) => onChange(Number(event.target.value))}
				slotProps={{
					htmlInput: { min: 1, max: 10, style: { textAlign: "center" } },
				}}
				sx={{ width: 68 }}
			/>
		</Box>
	);
}

function SettingSwitch({
	label,
	checked,
	onChange,
}: {
	label: string;
	checked: boolean;
	onChange: (checked: boolean) => void;
}) {
	return (
		<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
			<Typography sx={{ flex: 1, fontSize: "0.88rem" }}>{label}</Typography>
			<Switch
				checked={checked}
				onChange={(event) => onChange(event.target.checked)}
				slotProps={{ input: { "aria-label": label } }}
			/>
		</Box>
	);
}
