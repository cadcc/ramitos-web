import { expect, test } from "@playwright/test";

test("catalog search, detail deep link, and reload", async ({ page }) => {
	await page.goto("/");
	const search = page.getByRole("textbox", { name: "Buscar curso" });
	await expect(search).toBeVisible();
	await search.fill("CC1001");
	await expect(page).toHaveURL(/q=CC1001/);
	const course = page.locator('a[href^="/curso/"]').first();
	await expect(course).toBeVisible();
	await course.click();
	await expect(page).toHaveURL(/\/curso\//);
	await expect(page.getByText(/Opiniones \(/)).toBeVisible();
	await page.reload();
	await expect(page.getByText(/Opiniones \(/)).toBeVisible();
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
