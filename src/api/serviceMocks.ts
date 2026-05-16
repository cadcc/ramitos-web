import { setupWorker } from "msw/browser";
import { getAccountServiceMock } from "./account/accountService.msw.ts";

const handlers = Object.entries(getAccountServiceMock).flatMap(([, getMock]) =>
	getMock(),
);

const worker = setupWorker(...handlers);

export async function initializeMocking() {
	return import.meta.env.VITE_API_MOCKING_ENABLED ? worker.start() : null;
}
