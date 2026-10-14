import { z } from "zod";
import config from "./reviewTags.json";

const key = z.string().regex(/^[a-z][a-z0-9_]*$/);
const tag = z.object({ key, label: z.string().min(1) });
const leafItem = z.discriminatedUnion("type", [
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
const item = z.union([
	leafItem,
	z.object({
		type: z.literal("group"),
		key,
		label: z.string().min(1),
		items: z.array(leafItem).min(1),
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
		const registerItem = (entry: z.infer<typeof item>) => {
			register(entry.key);
			if (entry.type === "group") entry.items.forEach(registerItem);
			else if (entry.type !== "tag")
				entry.tags.forEach((tag) => register(tag.key));
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
			section.items.forEach(registerItem);
		}
	});
export type ReviewTagItem = z.infer<typeof item>;
export const REVIEW_TAG_SECTIONS = reviewTagConfigSchema.parse(config).sections;
const tagInfo = new Map<string, { label: string; axis?: string }>();
const exclusiveGroups = new Map<string, string[]>();
function indexItem(entry: ReviewTagItem, axis?: string, groupLabel?: string) {
	if (entry.type === "group") {
		entry.items.forEach((child) => indexItem(child, axis, entry.label));
		return;
	}
	const tags = entry.type === "tag" ? [entry] : entry.tags;
	const prefix = entry.type === "collection" ? entry.label : groupLabel;
	for (const tag of tags) {
		tagInfo.set(tag.key, {
			label: prefix ? `${prefix}: ${tag.label}` : tag.label,
			axis,
		});
		if (entry.type === "exclusive")
			exclusiveGroups.set(
				tag.key,
				tags.map((tag) => tag.key),
			);
	}
}
for (const section of REVIEW_TAG_SECTIONS) {
	section.items.forEach((entry) => indexItem(entry, section.axis));
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
