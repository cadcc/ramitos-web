import { expect, test } from "@playwright/test";

test("internal login works offline and rejects incorrect credentials", async ({
	page,
}) => {
	await page.goto("/");
	await page.getByRole("button", { name: "Ingresar", exact: true }).click();
	const dialog = page.getByRole("dialog");
	await dialog
		.getByRole("button", { name: "Ingresar con credenciales internas" })
		.click();
	await dialog
		.getByRole("textbox", { name: "Usuario", exact: true })
		.fill("admin");
	await dialog.locator('input[type="password"]').fill("wrong");
	await dialog.getByRole("button", { name: "Ingresar", exact: true }).click();
	await expect(dialog.getByRole("alert")).toBeVisible();
	// Session failure clears mounted account state, including the local form.
	await dialog
		.getByRole("button", { name: "Ingresar con credenciales internas" })
		.click();
	await dialog
		.getByRole("textbox", { name: "Usuario", exact: true })
		.fill("admin");
	await dialog.locator('input[type="password"]').fill("mock");
	await dialog.getByRole("button", { name: "Ingresar", exact: true }).click();
	await expect(dialog).toHaveCount(0);
	await page.goto("/admin");
	await expect(
		page.getByRole("heading", { name: "Panel de Moderación" }),
	).toBeVisible();
});

test("simulated DCC login returns to the original page and survives reload", async ({
	page,
}) => {
	await page.goto("/curso/CC4101");
	await page.getByRole("button", { name: "Ingresar", exact: true }).click();
	await page
		.getByRole("button", { name: "Ingresar con cuenta DCC", exact: true })
		.click();
	await expect(
		page.getByRole("button", { name: "Abrir menú de cuenta" }),
	).toBeVisible();
	await expect(page).toHaveURL(/\/curso\/CC4101/);
	await page.reload();
	await expect(
		page.getByRole("button", { name: "Abrir menú de cuenta" }),
	).toBeVisible();
});
