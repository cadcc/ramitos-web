import { Box, Typography } from "@mui/material";
import { Link } from "@tanstack/react-router";
import { getAcmClassificationTree } from "../../../constants/acmTaxonomy";

export function CourseAcmClassifications({
	units,
}: {
	units: readonly string[];
}) {
	const groups = getAcmClassificationTree(units);
	if (groups.length === 0) return null;

	return (
		<Box
			component="section"
			aria-label="Clasificación ACM"
			sx={{
				mb: 2,
				"& ul": { listStyle: "none", m: 0, p: 0 },
				"& a": { color: "inherit", textDecoration: "none" },
				"& a:hover": { color: "primary.main", textDecoration: "underline" },
			}}
		>
			<Typography
				component="h2"
				variant="caption"
				color="text.secondary"
				sx={{ display: "block", mb: 1 }}
			>
				Clasificación ACM
			</Typography>
			<Box component="ul" sx={{ display: "grid", gap: 1.5 }}>
				{groups.map((group) => (
					<Box component="li" key={group.id}>
						<Typography
							component="div"
							variant="body2"
							sx={{ fontWeight: 600, mb: 0.5 }}
						>
							<Link to="/" search={{ acmArea: group.id }}>
								{group.label}
							</Link>
						</Typography>
						<Box
							component="ul"
							sx={{
								borderLeft: 1,
								borderColor: "divider",
								"&&": { pl: 1.5 },
								display: "grid",
								gap: 0.75,
							}}
						>
							{group.children?.map((area) => (
								<Box component="li" key={area.id}>
									<Typography
										component="div"
										variant="caption"
										sx={{ fontWeight: 600 }}
									>
										<Link to="/" search={{ acmArea: area.id }}>
											{area.label}
										</Link>
									</Typography>
									<Box
										component="ul"
										sx={{
											display: "flex",
											flexWrap: "wrap",
											columnGap: 1.25,
											rowGap: 0.25,
										}}
									>
										{area.children?.map((unit) => (
											<Typography
												component="li"
												variant="caption"
												color="text.secondary"
												key={unit.id}
												sx={{ overflowWrap: "anywhere" }}
											>
												<Link to="/" search={{ acmArea: unit.id }}>
													{unit.label}
												</Link>
											</Typography>
										))}
									</Box>
								</Box>
							))}
						</Box>
					</Box>
				))}
			</Box>
		</Box>
	);
}
