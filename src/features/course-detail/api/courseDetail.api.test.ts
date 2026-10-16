import { expect, it, vi } from "vitest";
import { getCourse } from "../../../generated/api/course/courseService";
import { getCourseDetail } from "./courseDetail.api";

vi.mock("../../auth", () => ({
	session: {
		authenticated: (request: (headers: Record<string, string>) => unknown) =>
			request({ Authorization: "Bearer test" }),
	},
}));
vi.mock("../../../generated/api/course/courseService", () => ({
	getCourse: vi.fn(),
}));

it("loads authenticated eligibility and preserves a false reviewable value", async () => {
	vi.mocked(getCourse).mockResolvedValueOnce({
		status: 200,
		data: {
			id: "CC1000",
			name: "Curso",
			stats: {},
			tag_stats: {},
			reviewCount: 0,
			enrolled: false,
			reviewable: false,
		},
		headers: new Headers(),
	});
	expect(await getCourseDetail("CC1000", true)).toMatchObject({
		enrolled: false,
		reviewable: false,
	});
	expect(getCourse).toHaveBeenLastCalledWith("CC1000", {
		headers: { Authorization: "Bearer test" },
	});
});

it("keeps missing eligibility unknown on a public request", async () => {
	vi.mocked(getCourse).mockResolvedValueOnce({
		status: 200,
		data: {
			id: "CC1000",
			name: "Curso",
			stats: {},
			tag_stats: {},
			reviewCount: 0,
		},
		headers: new Headers(),
	});
	expect((await getCourseDetail("CC1000"))?.reviewable).toBeUndefined();
	expect(getCourse).toHaveBeenLastCalledWith("CC1000");
});
