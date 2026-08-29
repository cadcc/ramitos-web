import type { SxProps, Theme } from "@mui/material/styles";

export const COURSE_CARD_MIN_HEIGHT = 116;

export const courseCardCodeSx = {
	fontSize: "0.65rem",
	lineHeight: 1.4,
} satisfies SxProps<Theme>;

export const courseCardTitleSx = {
	fontFamily: '"Space Grotesk", sans-serif',
	fontWeight: 600,
	fontSize: "0.95rem",
	lineHeight: 1.25,
} satisfies SxProps<Theme>;

export const courseCardOpinionSx = {
	fontSize: "0.7rem",
} satisfies SxProps<Theme>;
