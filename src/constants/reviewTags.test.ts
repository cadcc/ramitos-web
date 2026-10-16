import { expect, it } from "vitest";
import config from "./reviewTags.json";
import {
	REVIEW_TAG_SECTIONS,
	getCourseSummaryTags,
	getReviewTagLabel,
	getReviewTagAxis,
	reviewTagConfigSchema,
	toggleReviewTag,
} from "./reviewTags";
it("hides zero-value tags and keeps only the highest-valued exclusive option", () => {
	expect(
		getCourseSummaryTags({
			variable_workload: { value: 2 },
			consistent_workload: { value: 7 },
			useful_work: { value: 0 },
			useful_research: { value: 3 },
		}),
	).toEqual(["consistent_workload", "useful_research"]);
});
it("resolves exclusive ties consistently and omits groups with no positive values", () => {
	expect(
		getCourseSummaryTags({
			consistent_workload: { value: 4 },
			variable_workload: { value: 4 },
		}),
	).toEqual(["variable_workload"]);
	expect(getCourseSummaryTags({ variable_workload: { value: 0 } })).toEqual([]);
});
it("loads all sections with stable identities and display labels", () => {
	expect(REVIEW_TAG_SECTIONS).toHaveLength(7);
	expect(getReviewTagLabel("useful_work")).toBe("Útil para: Industria");
	expect(getReviewTagAxis("variable_workload")).toBe("carga");
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
			["variable_workload", "useful_work"],
			"consistent_workload",
		),
	).toEqual(["useful_work", "consistent_workload"]);
	expect(
		toggleReviewTag(["consistent_workload"], "consistent_workload"),
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

it("keeps independent tags selected inside a group containing exclusive options", () => {
	expect(getReviewTagLabel("filler")).toBe("Contenido: Relleno");
	expect(getReviewTagAxis("cutting_edge")).toBe("relevancia");
	expect(toggleReviewTag(["cutting_edge", "filler"], "outdated")).toEqual([
		"filler",
		"outdated",
	]);
	expect(toggleReviewTag(["outdated", "filler"], "filler")).toEqual([
		"outdated",
	]);
});
