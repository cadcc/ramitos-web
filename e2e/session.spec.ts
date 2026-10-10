import { expect, test } from "@playwright/test";

const key = "ramitos-session-v1";
function token(role: "admin" | "stats") {
	return `e30.${Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600, account: { id: role === "admin" ? 1 : 2, name: "Session Test", role } })).toString("base64url")}.test`;
}

test("admin waits for verification and ignores a forged stored role", async ({
	page,
}) => {
	await page.addInitScript(
		({ credential }) => {
			localStorage.setItem("ramitos-token", credential);
			localStorage.setItem(
				"ramitos-user",
				JSON.stringify({ id: 1, role: "admin" }),
			);
		},
		{ credential: token("stats") },
	);
	await page.goto("/admin");
	await expect(page).toHaveURL(/\/$/);
	await expect(
		page.getByRole("heading", { name: "Panel de Moderación" }),
	).toHaveCount(0);
	await expect(
		page.getByRole("button", { name: "Abrir menú de cuenta" }),
	).toBeVisible();
});

test("logout propagates to another tab and withdraws mounted admin access", async ({
	page,
	context,
}) => {
	await page.addInitScript(
		({ credential, storageKey }) => {
			if (!localStorage.getItem(storageKey))
				localStorage.setItem("ramitos-token", credential);
		},
		{ credential: token("admin"), storageKey: key },
	);
	await page.goto("/admin");
	await expect(
		page.getByRole("heading", { name: "Panel de Moderación" }),
	).toBeVisible();
	const second = await context.newPage();
	await second.goto("/admin");
	await expect(
		second.getByRole("heading", { name: "Panel de Moderación" }),
	).toBeVisible();
	await page.getByRole("button", { name: "Abrir menú de cuenta" }).click();
	await page.getByRole("menuitem", { name: "Cerrar sesión" }).click();
	await expect(second).toHaveURL(/\/$/);
	await expect(
		second.getByRole("button", { name: "Ingresar", exact: true }),
	).toBeVisible();
	await second.reload();
	await expect(
		second.getByRole("button", { name: "Ingresar", exact: true }),
	).toBeVisible();
});

test("temporary verification failure preserves credentials and allows retry", async ({
	page,
}) => {
	await page.addInitScript(
		({ credential }) => {
			localStorage.setItem("ramitos-token", credential);
			const originalFetch = window.fetch.bind(window);
			let fail = true;
			window.fetch = (input, init) => {
				if (
					(typeof input === "string"
						? input
						: input instanceof URL
							? input.href
							: input.url
					).includes("/api/accounts/@me") &&
					fail
				) {
					fail = false;
					return Promise.reject(new TypeError("Test offline"));
				}
				return originalFetch(input, init);
			};
		},
		{ credential: token("admin") },
	);
	await page.goto("/admin");
	await expect(page.getByRole("button", { name: "Reintentar" })).toBeVisible();
	await expect(
		page.getByRole("heading", { name: "Panel de Moderación" }),
	).toHaveCount(0);
	expect(
		await page.evaluate((storageKey) => localStorage.getItem(storageKey), key),
	).toContain("token");
	await page.getByRole("button", { name: "Reintentar" }).click();
	await expect(
		page.getByRole("heading", { name: "Panel de Moderación" }),
	).toBeVisible();
});

test("DCC callback exchanges once under StrictMode and navigates after acceptance", async ({
	page,
}) => {
	await page.addInitScript(
		({ credential }) => {
			const originalFetch = window.fetch.bind(window);
			window.fetch = (input, init) => {
				const url =
					typeof input === "string"
						? input
						: input instanceof URL
							? input.href
							: input.url;
				if (url.includes("/api/workflow/login/dcc/finish")) {
					sessionStorage.setItem(
						"test-dcc-exchanges",
						String(
							Number(sessionStorage.getItem("test-dcc-exchanges") ?? 0) + 1,
						),
					);
					return Promise.resolve(
						new Response(JSON.stringify({ accessToken: credential }), {
							status: 200,
							headers: { "Content-Type": "application/json" },
						}),
					);
				}
				return originalFetch(input, init);
			};
		},
		{ credential: token("admin") },
	);
	await page.goto(
		"/auth/dcc/callback?status=ok&workflow=dccLogin&secret=browser-test&returnTo=%2Fmalla",
	);
	await expect(page).toHaveURL(/\/malla$/);
	await expect(
		page.getByRole("button", { name: "Abrir menú de cuenta" }),
	).toBeVisible();
	expect(
		await page.evaluate(() => sessionStorage.getItem("test-dcc-exchanges")),
	).toBe("1");
});

test("an invalid callback does not leave protected navigation waiting forever", async ({
	page,
}) => {
	await page.goto("/auth/dcc/callback?status=rejected");
	await expect(
		page.getByRole("heading", { name: "No pudimos completar el ingreso" }),
	).toBeVisible();
	await page.getByRole("link", { name: "Volver al inicio" }).click();
	await page.goto("/admin");
	await expect(page).toHaveURL(/\/$/);
});
