import { afterAll, beforeAll, expect, it } from "vitest";
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

const server = setupServer(...handlers);
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterAll(() => server.close());
const origin = "http://localhost";

async function login(username: string, password = "mock") {
	return fetch(`${origin}/api/workflow/login/pass`, {
		method: "POST",
		body: JSON.stringify({ username, password }),
	});
}

it.each([
	["admin", "admin"],
	["student", "none"],
	["moderator", "mod"],
])(
	"logs in as %s and verifies the expected account role",
	async (username, role) => {
		const response = await login(username);
		expect(response.status).toBe(200);
		const { accessToken } = (await response.json()) as { accessToken: string };
		const payload = JSON.parse(atob(accessToken.split(".")[1]!)) as {
			exp: number;
		};
		expect(payload.exp).toBeGreaterThan(Date.now() / 1000);
		const self = await fetch(`${origin}/api/accounts/@me`, {
			headers: { Authorization: `Bearer ${accessToken}` },
		});
		expect(await self.json()).toMatchObject({ role });
	},
);

it("rejects incorrect local login credentials", async () => {
	expect((await login("admin", "wrong")).status).toBe(400);
	expect((await login("unknown")).status).toBe(400);
});

it("creates and updates an account, then verifies the updated profile with the same session", async () => {
	const created = await fetch(`${origin}/api/accounts`, {
		method: "POST",
		body: JSON.stringify({
			username: "fixture-account",
			password: "fixture-password",
			name: "María Pérez",
			role: "stats",
		}),
	});
	expect(created.status).toBe(200);
	const account = (await created.json()) as { id: number; name: string };
	expect(account.name).toBe("María Pérez");
	const response = await login("fixture-account", "fixture-password");
	const { accessToken } = (await response.json()) as { accessToken: string };
	const headers = { Authorization: `Bearer ${accessToken}` };
	const updated = await fetch(`${origin}/api/accounts/${account.id}`, {
		method: "PATCH",
		headers,
		body: JSON.stringify({ name: "María Actualizada" }),
	});
	expect(await updated.json()).toMatchObject({
		id: account.id,
		name: "María Actualizada",
	});
	const self = await fetch(`${origin}/api/accounts/@me`, { headers });
	expect(await self.json()).toMatchObject({
		id: account.id,
		name: "María Actualizada",
		role: "stats",
	});
	expect(
		(
			await fetch(`${origin}/api/accounts/999999`, {
				method: "PATCH",
				body: "{}",
			})
		).status,
	).toBe(404);
});

it("exchanges the simulated DCC callback for a student session", async () => {
	const exchange = (secret: string) =>
		fetch(`${origin}/api/workflow/login/dcc/finish`, {
			method: "POST",
			body: JSON.stringify({ secret }),
		});
	expect((await exchange("wrong")).status).toBe(400);
	const response = await exchange("ramitos-mock-dcc");
	expect(response.status).toBe(200);
	const { accessToken } = (await response.json()) as { accessToken: string };
	const self = await fetch(`${origin}/api/accounts/@me`, {
		headers: { Authorization: `Bearer ${accessToken}` },
	});
	expect(await self.json()).toMatchObject({ id: 2, role: "none" });
});
