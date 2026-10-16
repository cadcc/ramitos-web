import { useLayoutEffect, useRef } from "react";
import { Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { courseCardTitleSx } from "./courseCard.styles";

// Reuse measurements when a populated skeleton becomes a loaded card.
const fittedSizes = new Map<string, number>();
let fontRevision = 0;
if (typeof document !== "undefined") {
	document.fonts.addEventListener("loadingdone", () => {
		fontRevision += 1;
		fittedSizes.clear();
	});
}

export function CourseCardTitle({ title }: { title: string }) {
	const containerRef = useRef<HTMLParagraphElement>(null);
	const textRef = useRef<HTMLSpanElement>(null);
	const theme = useTheme();

	useLayoutEffect(() => {
		const container = containerRef.current;
		const text = textRef.current;
		if (!container || !text) return;
		let disposed = false;
		const fit = () => {
			if (disposed || container.clientWidth === 0) return;
			const style = getComputedStyle(container);
			const baseSize = Number.parseFloat(style.fontSize);
			const key = JSON.stringify([
				title,
				container.clientWidth,
				style.fontSize,
				style.fontFamily,
				style.fontWeight,
				style.letterSpacing,
				fontRevision,
			]);
			const cached = fittedSizes.get(key);
			if (cached !== undefined) {
				text.style.fontSize = `${cached}px`;
				return;
			}
			const remember = (size: number) => {
				if (fittedSizes.size >= 1000) fittedSizes.clear();
				fittedSizes.set(key, size);
			};
			const fits = (size: number) => {
				text.style.fontSize = `${size}px`;
				const lineHeight = Number.parseFloat(getComputedStyle(text).lineHeight);
				return text.scrollHeight <= lineHeight * 2 + 0.5;
			};
			if (fits(baseSize)) {
				remember(baseSize);
				return;
			}
			let lower = 1;
			let upper = baseSize;
			while (upper - lower > 0.1) {
				const middle = (lower + upper) / 2;
				if (fits(middle)) lower = middle;
				else upper = middle;
			}
			text.style.fontSize = `${lower}px`;
			remember(lower);
		};
		fit();
		const observer = new ResizeObserver(fit);
		observer.observe(container);
		void document.fonts.ready.then(fit);
		document.fonts.addEventListener("loadingdone", fit);
		return () => {
			disposed = true;
			observer.disconnect();
			document.fonts.removeEventListener("loadingdone", fit);
		};
	}, [title, theme]);

	return (
		<Typography
			ref={containerRef}
			variant="body1"
			sx={{ ...courseCardTitleSx, height: "2.375rem" }}
		>
			<span
				ref={textRef}
				style={{ display: "block", lineHeight: 1.25, overflowWrap: "anywhere" }}
			>
				{title}
			</span>
		</Typography>
	);
}
