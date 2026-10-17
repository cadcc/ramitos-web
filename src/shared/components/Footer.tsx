import { Box, Typography, Link as MuiLink } from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";

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
					flexWrap: "wrap",
					alignItems: "center",
					justifyContent: "center",
					gap: 0.75,
					fontSize: { xs: "0.72rem", sm: "0.8rem" },
				}}
			>
				<GitHubIcon sx={{ fontSize: 16 }} />
				<MuiLink
					href="https://github.com/cadcc/ramitos-web"
					target="_blank"
					rel="noopener"
					color="inherit"
					underline="hover"
				>
					Frontend
				</MuiLink>
				{import.meta.env.VITE_APP_VERSION && (
					<Box component="span" sx={{ whiteSpace: "nowrap" }}>
						{import.meta.env.VITE_APP_VERSION}
					</Box>
				)}
				//
				<GitHubIcon sx={{ fontSize: 16 }} />
				<MuiLink
					href="https://github.com/cadcc/Ramitos-Backend"
					target="_blank"
					rel="noopener"
					color="inherit"
					underline="hover"
				>
					Backend
				</MuiLink>
				// del dcc pal dcc &lt;3
			</Typography>
		</Box>
	);
}
