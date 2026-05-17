import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { Box, Link as MuiLink } from "@mui/material";
import type { Components } from "react-markdown";

const markdownComponents: Components = {
	a({ href, children }) {
		if (!href) return <>{children}</>;
		return (
			<MuiLink
				href={href}
				target="_blank"
				rel="noopener noreferrer"
				underline="hover"
			>
				{children}
			</MuiLink>
		);
	},
	img({ src, alt }) {
		if (!src) return null;
		return (
			<Box
				component="img"
				src={src}
				alt={alt ?? ""}
				sx={{
					maxWidth: "100%",
					height: "auto",
					borderRadius: 1,
					my: 1,
					display: "block",
				}}
				loading="lazy"
			/>
		);
	},
};

interface Props {
	children: string;
	maxWidth?: number;
}

export default function ReviewCommentMarkdown({
	children,
	maxWidth = 560,
}: Props) {
	const trimmed = children.trim();
	if (!trimmed) return null;

	return (
		<Box
			sx={{
				maxWidth,
				fontSize: "0.88rem",
				lineHeight: 1.65,
				color: "text.primary",
				wordBreak: "break-word",
				"& p": { m: 0, mb: 1.25, "&:last-child": { mb: 0 } },
				"& ul, & ol": { pl: 2.5, my: 1, "&:first-of-type": { mt: 0 } },
				"& li": { mb: 0.35 },
				"& li > p": { mb: 0.5 },
				"& code": {
					fontFamily:
						"ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
					fontSize: "0.82em",
					bgcolor: "action.hover",
					px: 0.45,
					py: 0.15,
					borderRadius: 0.5,
				},
				"& pre": {
					bgcolor: "action.hover",
					p: 1.5,
					borderRadius: 1,
					overflow: "auto",
					my: 1.25,
					maxWidth: "100%",
					"& code": { bgcolor: "transparent", p: 0, fontSize: "0.8rem" },
				},
				"& blockquote": {
					borderLeft: 4,
					borderColor: "divider",
					pl: 1.5,
					ml: 0,
					my: 1.25,
					color: "text.secondary",
				},
				"& table": {
					borderCollapse: "collapse",
					width: "100%",
					my: 1.25,
					fontSize: "0.85rem",
					display: "block",
					overflowX: "auto",
				},
				"& th, & td": {
					border: 1,
					borderColor: "divider",
					p: 0.75,
					textAlign: "left",
				},
				"& th": { bgcolor: "action.hover" },
				"& hr": { border: 0, borderTop: 1, borderColor: "divider", my: 2 },
				"& h1, & h2, & h3, & h4": {
					fontFamily: '"Space Grotesk", sans-serif',
					fontWeight: 700,
					lineHeight: 1.25,
					mt: 1.75,
					mb: 0.75,
					"&:first-of-type": { mt: 0 },
				},
				"& h1": { fontSize: "1.15rem" },
				"& h2": { fontSize: "1.05rem" },
				"& h3": { fontSize: "1rem" },
				"& h4": { fontSize: "0.95rem" },
			}}
		>
			<ReactMarkdown
				remarkPlugins={[remarkGfm, remarkBreaks]}
				components={markdownComponents}
			>
				{trimmed}
			</ReactMarkdown>
		</Box>
	);
}
