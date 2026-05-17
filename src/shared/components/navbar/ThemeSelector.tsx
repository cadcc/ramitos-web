import { useState } from "react";
import {
	Tooltip,
	IconButton,
	Menu,
	MenuItem,
	Box,
	ListItemIcon,
	ListItemText,
} from "@mui/material";
import { Palette as PaletteIcon } from "@mui/icons-material";
import { useThemeMode } from "../../providers/ThemeProvider";
import { type ThemeKey } from "../../styles";

export default function ThemeSelector() {
	const { currentTheme, setTheme, availableThemes } = useThemeMode();
	const [themeAnchorEl, setThemeAnchorEl] = useState<null | HTMLElement>(null);

	const handleThemeMenuOpen = (e: React.MouseEvent<HTMLElement>) => {
		setThemeAnchorEl(e.currentTarget);
	};

	const handleThemeMenuClose = () => {
		setThemeAnchorEl(null);
	};

	const handleThemeSelect = (themeKey: ThemeKey) => {
		setTheme(themeKey);
		handleThemeMenuClose();
	};

	return (
		<>
			<Tooltip title="Cambiar tema">
				<IconButton onClick={handleThemeMenuOpen} size="small" color="inherit">
					<PaletteIcon fontSize="small" />
				</IconButton>
			</Tooltip>

			<Menu
				anchorEl={themeAnchorEl}
				open={Boolean(themeAnchorEl)}
				onClose={handleThemeMenuClose}
				transformOrigin={{ horizontal: "right", vertical: "top" }}
				anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
				slotProps={{ paper: { sx: { mt: 1 } } }}
			>
				{availableThemes.map((config) => (
					<MenuItem
						key={config.id}
						selected={config.id === currentTheme}
						onClick={() => handleThemeSelect(config.id as ThemeKey)}
						disableRipple
						sx={{
							p: "3px 8px",

							"&:hover": { backgroundColor: "transparent" },
							"&.Mui-selected": { backgroundColor: "transparent" },
							"&.Mui-selected:hover": { backgroundColor: "transparent" },

							".theme-preview": {
								border: "2px solid",
								borderColor: "transparent",
							},

							"&:hover .theme-preview": {
								transform: "scale(1.03)",
								boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
								borderColor: "primary.light",
							},

							"&.Mui-selected .theme-preview": {
								borderColor: "primary.dark",
							},
						}}
					>
						<Box
							className="theme-preview"
							sx={{
								display: "flex",
								alignItems: "center",
								width: "100%",
								background: config.label.background,
								borderRadius: "8px",
								p: "6px 8px",
								marginInline: "auto",
								transition: "all 0.15s ease-in-out",
							}}
						>
							<ListItemIcon>
								{config.icon.type === "image" ? (
									<Box
										component="img"
										src={config.icon.url}
										sx={{
											objectFit: "contain",
											width: "1.25rem",
											height: "1.25rem",
											marginInline: "auto",
											display: "inline-block",
											userSelect: "none",
										}}
									/>
								) : (
									(() => {
										const IconComponent = config.icon.component;
										return (
											<IconComponent
												fontSize="small"
												htmlColor={config.icon.color}
												sx={{ marginInline: "auto" }}
											/>
										);
									})()
								)}
							</ListItemIcon>
							<ListItemText
								slotProps={{
									primary: {
										sx: {
											fontFamily:
												config.label.fontFamily ??
												config.theme.typography.fontFamily,
											fontWeight: "bold",
											pr: "4px",
											color: config.label.color,
										},
									},
								}}
							>
								{config.name}
							</ListItemText>
						</Box>
					</MenuItem>
				))}
			</Menu>
		</>
	);
}
