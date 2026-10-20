import { expect, test } from "@playwright/test";

test("mock catalog has courses in every category", async ({ page }) => {
	await page.goto("/");
	for (const name of [
		"Obligatorios",
		"Electivos Especialidad",
		"Electivos Licenciatura",
		"Núcleo Gestión",
		"Formación Integral",
	]) {
		await page.getByRole("button", { name, exact: true }).click();
		await expect(page.locator('a[href^="/curso/"]').first()).toBeVisible();
	}
});

test("mock course detail displays review tag summaries", async ({ page }) => {
	await page.goto("/curso/CC4101");
	const summary = page.getByRole("region", { name: "Así lo describen" });
	await expect(summary).toBeVisible();
	await expect(summary).toContainText(
		/Carga:|Dificultad:|Docencia:|Relevancia:|Ambiente:/,
	);
});

test("catalog search, detail deep link, and reload", async ({ page }) => {
	await page.goto("/");
	const search = page.getByRole("textbox", { name: "Buscar curso" });
	await expect(search).toBeVisible();
	await search.fill("CC1000");
	await expect(page).toHaveURL(/q=CC1000/);
	const course = page.locator('a[href^="/curso/"]').first();
	await expect(course).toBeVisible();
	await course.click();
	await expect(page).toHaveURL(/\/curso\//);
	await expect(page.getByText(/Comentarios \(/)).toBeVisible();
	await page.reload();
	await expect(page.getByText(/Comentarios \(/)).toBeVisible();
});

test("roadmap deep link and anonymous admin redirect", async ({ page }) => {
	await page.goto("/malla");
	await expect(page.getByRole("heading", { name: "Malla DCC" })).toBeVisible();
	await expect(
		page.getByRole("button", { name: "Configurar malla" }),
	).toBeVisible();
	await page.goto("/admin");
	await expect(page).toHaveURL(/\/$/);
	await expect(
		page.getByRole("textbox", { name: "Buscar curso" }),
	).toBeVisible();
});
