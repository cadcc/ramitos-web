import { expect, test } from "@playwright/test";

for (const width of [390, 599, 600, 1280]) {
	test(`semester labels stay clear of courses at ${width}px`, async ({
		page,
	}, testInfo) => {
		await page.setViewportSize({ width, height: 844 });
		await page.goto("/malla");
		const firstSemester = page.getByLabel("Semestre 1", { exact: true });
		await expect(firstSemester).toBeVisible();

		async function expectNoOverlap() {
			const semesters = page.getByLabel(/^Semestre \d+$/);
			for (const semester of await semesters.all()) {
				const label = semester.getByText(/^S\d+$/, { exact: true });
				const labelBox = await label.locator("..").boundingBox();
				const coursesBox = await semester
					.getByRole("list", { name: "Cursos" })
					.boundingBox();
				expect(labelBox).not.toBeNull();
				expect(coursesBox).not.toBeNull();
				if (width < 600) {
					expect(labelBox!.y + labelBox!.height).toBeLessThanOrEqual(
						coursesBox!.y,
					);
				} else {
					expect(labelBox!.x + labelBox!.width).toBeLessThanOrEqual(
						coursesBox!.x,
					);
				}
			}
		}

		await expectNoOverlap();
		if (width < 600) {
			const courses = firstSemester.getByRole("list", { name: "Cursos" });
			const listBox = (await courses.boundingBox())!;
			const cards = courses.getByRole("listitem");
			const firstBox = (await cards.first().boundingBox())!;
			const columnCount = Math.round(
				(listBox.width + 8) / (firstBox.width + 8),
			);
			const lastBox = (await cards.nth(columnCount - 1).boundingBox())!;
			expect(firstBox.x).toBeCloseTo(listBox.x, 0);
			expect(lastBox.y).toBeCloseTo(firstBox.y, 0);
			expect(lastBox.x + lastBox.width).toBeCloseTo(
				listBox.x + listBox.width,
				0,
			);
		}
		await page.screenshot({ path: testInfo.outputPath("roadmap.png") });
		await page.evaluate(() => window.scrollTo(0, 300));
		await expectNoOverlap();
		await page.getByRole("button", { name: "Marcar avance" }).click();
		await expectNoOverlap();
		await firstSemester.getByText("S1", { exact: true }).click();
		const cards = firstSemester.getByRole("listitem");
		for (const card of await cards.all()) {
			await expect(card).toHaveAttribute("data-marked", "true");
		}
	});
}
