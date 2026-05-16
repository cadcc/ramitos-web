import { setupWorker } from "msw/browser";
import { getAccountServiceMock } from "./account/accountService.msw.ts";
import { getCourseServiceMock } from "./course/courseService.msw.ts";

const handlers = [...getAccountServiceMock(), ...getCourseServiceMock()];

const worker = setupWorker(...handlers);

export async function initializeMocking() {
	return import.meta.env.VITE_API_MOCKING_ENABLED === "true"
		? worker.start()
		: null;
}
