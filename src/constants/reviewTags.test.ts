import { expect, it } from "vitest";
import config from "./reviewTags.json";
import {
	REVIEW_TAG_SECTIONS,
	getReviewTagLabel,
	getReviewTagAxis,
	reviewTagConfigSchema,
	toggleReviewTag,
} from "./reviewTags";
it("loads all sections with stable identities and display labels", () => {
	expect(REVIEW_TAG_SECTIONS).toHaveLength(7);
	expect(getReviewTagLabel("useful_work")).toBe("Útil para: Industria");
	expect(getReviewTagAxis("distributed_workload")).toBe("carga");
	expect(getReviewTagLabel("Unknown server tag")).toBe("Unknown server tag");
});
it("keeps collection selections independent", () => {
	const selected = toggleReviewTag(["useful_work"], "useful_research");
	expect(selected).toEqual(["useful_work", "useful_research"]);
	expect(toggleReviewTag(selected, "useful_work")).toEqual(["useful_research"]);
});
it("replaces the other exclusive option without affecting unrelated selections", () => {
	expect(
		toggleReviewTag(
			["distributed_workload", "useful_work"],
			"concentrated_workload",
		),
	).toEqual(["useful_work", "concentrated_workload"]);
	expect(
		toggleReviewTag(["concentrated_workload"], "concentrated_workload"),
	).toEqual([]);
});
it("rejects duplicate keys and invalid grouping definitions", () => {
	const duplicate = structuredClone(config);
	duplicate.sections.push(duplicate.sections[0]!);
	expect(reviewTagConfigSchema.safeParse(duplicate).success).toBe(false);
	expect(
		reviewTagConfigSchema.safeParse({
			sections: [
				{
					key: "test",
					label: "Test",
					question: "Test?",
					items: [
						{
							type: "exclusive",
							key: "group",
							tags: [{ key: "one", label: "One" }],
						},
					],
				},
			],
		}).success,
	).toBe(false);
});
it("allows label edits without changing tag identities", () => {
	const edited = structuredClone(config);
	edited.sections[0]!.label = "Nueva etiqueta";
	const parsed = reviewTagConfigSchema.parse(edited);
	expect(parsed.sections[0]!.items).toEqual(REVIEW_TAG_SECTIONS[0]!.items);
});

it("keeps three-way delivery mode and timing exclusivity independent", () => {
	let selected = toggleReviewTag(
		["online", "synchronous", "heavy_group_work"],
		"hybrid",
	);
	selected = toggleReviewTag(selected, "in_person");
	selected = toggleReviewTag(selected, "asynchronous");
	expect(selected).toEqual(["heavy_group_work", "in_person", "asynchronous"]);
});
