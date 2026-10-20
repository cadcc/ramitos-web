import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControlLabel,
	Switch,
	Typography,
	Box,
} from "@mui/material";
import {
	usePreviewFeatures,
	type PreviewFeature,
} from "../../hooks/usePreviewFeatures";

const options: { key: PreviewFeature; label: string; description: string }[] = [
	{
		key: "placeholderCourses",
		label: "Cursos no disponibles",
		description:
			"Muestra tarjetas grises para cursos clasificados que aún no están disponibles en Ramitos.",
	},
	{
		key: "courseSummaries",
		label: "Resúmenes de cursos",
		description: "Muestra un resumen del programa en la página de cada curso.",
	},
	{
		key: "categories",
		label: "Áreas",
		description: "Permite explorar y filtrar cursos por sus áreas temáticas.",
	},
	{
		key: "acmCategories",
		label: "Categorías ACM",
		description:
			"Activa la taxonomía ACM, sus filtros y las clasificaciones de los cursos.",
	},
];

export function PreviewFeaturesDialog({
	open,
	onClose,
}: {
	open: boolean;
	onClose: () => void;
}) {
	const { features, setFeature } = usePreviewFeatures();
	return (
		<Dialog
			open={open}
			onClose={onClose}
			fullWidth
			maxWidth="sm"
			aria-labelledby="preview-features-title"
		>
			<DialogTitle id="preview-features-title">Experimentos</DialogTitle>
			<DialogContent>
				{options.map((option) => (
					<Box
						key={option.key}
						sx={{ py: 1.5, "& + &": { borderTop: 1, borderColor: "divider" } }}
					>
						<FormControlLabel
							sx={{
								m: 0,
								width: "100%",
								justifyContent: "space-between",
								alignItems: "flex-start",
							}}
							labelPlacement="start"
							control={
								<Switch
									checked={features[option.key]}
									onChange={(_, enabled) => setFeature(option.key, enabled)}
									slotProps={{
										input: { role: "switch", "aria-label": option.label },
									}}
								/>
							}
							label={
								<Box component="span" sx={{ pr: 2 }}>
									<Typography
										component="span"
										variant="body1"
										sx={{ display: "block", fontWeight: 600 }}
									>
										{option.label}
									</Typography>
									<Typography
										component="span"
										variant="body2"
										color="text.secondary"
										sx={{ display: "block" }}
									>
										{option.description}
									</Typography>
								</Box>
							}
						/>
					</Box>
				))}
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>Listo</Button>
			</DialogActions>
		</Dialog>
	);
}
