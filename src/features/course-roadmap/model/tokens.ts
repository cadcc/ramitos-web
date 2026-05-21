import type { RoadmapMarkColor } from "./types";

export const roadmapColors = {
	prerequisite: "oklch(63% 0.14 300)",
	postrequisite: "oklch(63% 0.14 59)",
	marks: {
		1: "oklch(63% 0.14 160)",
		2: "oklch(63% 0.14 230)",
		3: "oklch(63% 0.14 23)",
		4: "oklch(63% 0.14 350)",
	} satisfies Record<RoadmapMarkColor, string>,
};

export const roadmapSizes = {
	courseWidth: "10rem",
	courseWidthSmall: "7.5rem",
	courseHeight: "5rem",
};
