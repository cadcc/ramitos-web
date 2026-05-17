import { Box, Typography, Link as MuiLink } from "@mui/material";
import { GitHub as GitHubIcon } from "@mui/icons-material";

export default function Footer() {
	return (
		<Box
			component="footer"
			sx={{
				mt: "auto",
				py: 3,
				px: 2,
				textAlign: "center",
				borderTop: 1,
				borderColor: "divider",
			}}
		>
			<Typography
				variant="body2"
				color="text.secondary"
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					gap: 0.75,
					fontSize: "0.8rem",
				}}
			>
				<GitHubIcon sx={{ fontSize: 16 }} />
				<MuiLink
					href="https://github.com/open-source-uc/ramitos"
					target="_blank"
					rel="noopener"
					color="inherit"
					underline="hover"
				>
					Ramitos
				</MuiLink>
				&mdash; Hecho con cariño para el DCC, U. de Chile
			</Typography>
		</Box>
	);
}
