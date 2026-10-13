import { z } from "zod";
import config from "./reviewTags.json";

const key = z.string().regex(/^[a-z][a-z0-9_]*$/);
const tag = z.object({ key, label: z.string().min(1) });
const item = z.discriminatedUnion("type", [
	tag.extend({ type: z.literal("tag") }),
	z.object({
		type: z.literal("collection"),
		key,
		label: z.string().min(1),
		tags: z.array(tag).min(1),
	}),
	z.object({
		type: z.literal("exclusive"),
		key,
		label: z.string().min(1).optional(),
		tags: z.array(tag).min(2),
	}),
]);
export const reviewTagConfigSchema = z
	.object({
		sections: z
			.array(
				z.object({
					key,
					label: z.string().min(1),
					question: z.string().min(1).optional(),
					axis: z
						.enum(["carga", "dificultad", "docencia", "relevancia", "vibes"])
						.optional(),
					items: z.array(item),
				}),
			)
			.min(1),
	})
	.superRefine((value, ctx) => {
		const keys = new Set<string>();
		const axes = new Set<string>();
		const register = (value: string) => {
			if (keys.has(value))
				ctx.addIssue({
					code: "custom",
					message: `Duplicate configuration key: ${value}`,
				});
			keys.add(value);
		};
		for (const section of value.sections) {
			register(section.key);
			if (section.axis) {
				if (axes.has(section.axis))
					ctx.addIssue({
						code: "custom",
						message: `Duplicate axis: ${section.axis}`,
					});
				axes.add(section.axis);
			}
			for (const entry of section.items) {
				register(entry.key);
				if (entry.type !== "tag")
					entry.tags.forEach((tag) => register(tag.key));
			}
		}
	});
export type ReviewTagItem = z.infer<typeof item>;
export const REVIEW_TAG_SECTIONS = reviewTagConfigSchema.parse(config).sections;
const tagInfo = new Map<string, { label: string; axis?: string }>();
const exclusiveGroups = new Map<string, string[]>();
for (const section of REVIEW_TAG_SECTIONS) {
	for (const entry of section.items) {
		const tags = entry.type === "tag" ? [entry] : entry.tags;
		for (const tag of tags) {
			tagInfo.set(tag.key, {
				label:
					entry.type === "collection"
						? `${entry.label}: ${tag.label}`
						: tag.label,
				axis: section.axis,
			});
			if (entry.type === "exclusive")
				exclusiveGroups.set(
					tag.key,
					tags.map((tag) => tag.key),
				);
		}
	}
}
export const ALL_REVIEW_TAGS = [...tagInfo.keys()];
export function getReviewTagLabel(key: string) {
	return tagInfo.get(key)?.label ?? key;
}
export function getReviewTagAxis(key: string) {
	return tagInfo.get(key)?.axis;
}
export function toggleReviewTag(selected: string[], key: string): string[] {
	if (selected.includes(key)) return selected.filter((tag) => tag !== key);
	const group = exclusiveGroups.get(key) ?? [];
	return [...selected.filter((tag) => !group.includes(tag)), key];
}
