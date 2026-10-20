import { expect, test } from "@playwright/test";

test("course titles fit two lines in equal-height slots after resizing", async ({
	page,
}) => {
	const names = ["Bases de Datos", "Algoritmos y Estructuras de Datos"];
	await page.goto("/");
	await expect(page.getByText(names[1]!, { exact: true })).toBeVisible();
	for (const width of [1024, 600, 390, 1280]) {
		await page.setViewportSize({ width, height: 900 });
		await expect
			.poll(async () => {
				return page
					.getByText(names[1]!, { exact: true })
					.evaluate((element) => {
						const style = getComputedStyle(element);
						return (
							element.scrollHeight <=
							Number.parseFloat(style.lineHeight) * 2 + 0.5
						);
					});
			})
			.toBe(true);
		const heights = await Promise.all(
			names.map((name) =>
				page
					.getByText(name, { exact: true })
					.evaluate(
						(element) => element.parentElement!.getBoundingClientRect().height,
					),
			),
		);
		expect(heights[0]).toBeCloseTo(heights[1]!, 2);
	}
});

test("next-page placeholders keep their dimensions when loaded", async ({
	page,
}) => {
	await page.setViewportSize({ width: 1024, height: 700 });
	await page.goto("/");
	const placeholders = page.getByLabel("Cargando cursos");
	await expect(
		page.getByRole("status", { name: "Cantidad de ramos" }),
	).toHaveText(/\d+ ramos/);
	await expect(placeholders).toHaveCount(1);
	await expect(placeholders.getByText(/opiniones/)).toHaveCount(0);
	await expect(placeholders.locator("svg")).toHaveCount(0);
	const link = placeholders.locator("a").first();
	const href = await link.getAttribute("href");
	const before = await link.evaluate((el) => {
		const rect = el.getBoundingClientRect();
		return {
			width: rect.width,
			height: rect.height,
			top: rect.top + window.scrollY,
		};
	});
	await link.scrollIntoViewIfNeeded();
	await expect(placeholders).toHaveCount(0);
	const after = await page.locator(`a[href="${href}"]`).evaluate((el) => {
		const rect = el.getBoundingClientRect();
		return {
			width: rect.width,
			height: rect.height,
			top: rect.top + window.scrollY,
		};
	});
	expect(after.width).toBeCloseTo(before.width, 1);
	expect(after.height).toBeCloseTo(before.height, 1);
	expect(after.top).toBeCloseTo(before.top, 1);
});
