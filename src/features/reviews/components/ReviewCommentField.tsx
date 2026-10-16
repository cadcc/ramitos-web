import { useEffect, useState } from "react";
import { Box, TextField, Typography, useMediaQuery } from "@mui/material";
import { MAX_REVIEW_COMMENT_LENGTH } from "../../../constants/reviews";

const prompts = [
	"Este ramo se trata de…",
	"En una clase típica…",
	"Los proyectos consisten en…",
	"La mayor parte del tiempo se va en…",
	"Lo más interesante que aprendí fue…",
	"Lo que más me sorprendió fue…",
	"Lo que más me costó fue…",
	"Lo mejor del ramo fue…",
	"Algo que podría mejorar es…",
	"Antes de tomarlo, me habría gustado saber que…",
	"Mi consejo para quienes lo tomen es…",
];

function shuffledPrompts(previous?: string) {
	const bag = [...prompts];
	for (let index = bag.length - 1; index > 0; index--) {
		const other = Math.floor(Math.random() * (index + 1));
		[bag[index], bag[other]] = [bag[other]!, bag[index]!];
	}
	if (bag[0] === previous) [bag[0], bag[1]] = [bag[1]!, bag[0]!];
	return bag;
}

interface Props {
	value: string;
	onChange: (value: string) => void;
	open: boolean;
	isMobile: boolean;
}

export function ReviewCommentField({ value, onChange, open, isMobile }: Props) {
	const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
	const [placeholder, setPlaceholder] = useState("");
	const empty = value.length === 0;

	useEffect(() => {
		if (!open || !empty || reducedMotion) return;
		let bag = shuffledPrompts();
		let index = 0;
		let length = 0;
		let deleting = false;
		let timer: ReturnType<typeof setTimeout>;
		const tick = () => {
			const prompt = bag[index]!;
			length += deleting ? -1 : 1;
			setPlaceholder(prompt.slice(0, length));
			let delay = deleting ? 25 : 55;
			if (!deleting && length === prompt.length) {
				deleting = true;
				delay = 2400;
			} else if (deleting && length === 0) {
				deleting = false;
				index++;
				if (index === bag.length) {
					bag = shuffledPrompts(prompt);
					index = 0;
				}
				delay = 400;
			}
			timer = setTimeout(tick, delay);
		};
		timer = setTimeout(tick, 400);
		return () => clearTimeout(timer);
	}, [open, empty, reducedMotion]);

	return (
		<Box>
			<Typography sx={{ fontWeight: 700, fontSize: "1rem", mb: 1.25 }}>
				Comentario
			</Typography>
			<TextField
				fullWidth
				placeholder={reducedMotion ? prompts[0] : placeholder}
				multiline
				minRows={isMobile ? 4 : 6}
				maxRows={24}
				value={value}
				onChange={(event) => onChange(event.target.value)}
				slotProps={{
					htmlInput: {
						maxLength: MAX_REVIEW_COMMENT_LENGTH,
						"aria-label": "Comentario (opcional)",
					},
				}}
				size="small"
			/>
		</Box>
	);
}
