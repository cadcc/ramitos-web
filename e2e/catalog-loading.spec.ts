import { expect, test } from "@playwright/test";

test.use({ serviceWorkers: "block" });

for (const theme of [
	"light",
	"dark",
	"minimalLight",
	"minimalDark",
	"cadcc",
	"bubblegum",
	"retro",
	"anakena",
]) {
	test(`catalog loading preserves card positions in ${theme}`, async ({
		page,
	}) => {
		await page.addInitScript((value) => {
			localStorage.setItem("ramitos-theme", value);
		}, theme);
		// Keep external font availability independent of the API loading stages.
		await page.route("https://fonts.**/**", (route) => route.abort());
		let releaseIndex!: () => void;
		let releaseCourses!: () => void;
		const indexGate = new Promise<void>((resolve) => (releaseIndex = resolve));
		const courseGate = new Promise<void>(
			(resolve) => (releaseCourses = resolve),
		);
		const courses = Array.from({ length: 24 }, (_, index) => ({
			code: `CC${6000 + index}`,
			name: index % 2 ? "Algoritmos y Estructuras de Datos" : "Bases de Datos",
			categories: [],
		}));
		await page.route("**/api/courses**", async (route) => {
			const isIndex = new URL(route.request().url()).pathname.endsWith(".json");
			await (isIndex ? indexGate : courseGate);
			await route.fulfill({
				json: isIndex
					? { count: courses.length, courses, categories: [] }
					: courses.map((course, index) => ({
							id: course.code,
							name: course.name,
							reviewCount: index % 2 ? 10 : 0,
							stats: {},
							tag_stats: {},
						})),
			});
		});
		await page.goto("/");
		const placeholders = page.getByLabel("Cargando cursos");
		await expect(placeholders.locator(".MuiCard-root")).toHaveCount(24);
		await page.evaluate(() => document.fonts.ready);
		const count = page.getByRole("status", { name: "Cantidad de ramos" });
		const countElement = await count.elementHandle();
		const countBefore = await count.boundingBox();
		await count.evaluate((element) => {
			element.setAttribute("data-first-content-opacity", "pending");
			const observer = new MutationObserver(() => {
				if (!element.textContent?.trim()) return;
				element.setAttribute(
					"data-first-content-opacity",
					getComputedStyle(element).opacity,
				);
				observer.disconnect();
			});
			observer.observe(element, { childList: true, subtree: true });
		});
		const measure = () =>
			page.locator(".MuiCard-root").evaluateAll((cards) =>
				cards.map((card) => {
					const rect = card.getBoundingClientRect();
					return [rect.x, rect.y + window.scrollY, rect.width, rect.height];
				}),
			);
		const initial = await measure();
		releaseIndex();
		await expect(page.getByText("24 ramos", { exact: true })).toBeVisible();
		await expect(count).toHaveAttribute("data-first-content-opacity", "1");
		expect(await count.boundingBox()).toEqual(countBefore);
		expect(
			await countElement.evaluate(
				(element) =>
					element ===
					document.querySelector('[aria-label="Cantidad de ramos"]'),
			),
		).toBe(true);
		await expect(placeholders.locator("a")).toHaveCount(24);
		const populated = await measure();
		releaseCourses();
		await expect(placeholders).toHaveCount(0);
		const loaded = await measure();
		expect(loaded).toHaveLength(24);
		for (const stage of [initial, populated]) {
			stage.forEach((card, index) => {
				card.forEach((value, dimension) => {
					expect(Math.abs(value - loaded[index]![dimension]!)).toBeLessThan(
						0.5,
					);
				});
			});
		}
	});
}
