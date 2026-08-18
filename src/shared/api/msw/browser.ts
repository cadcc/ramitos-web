import { setupWorker } from "msw/browser";
import {
	getGetSelfMockHandler,
	getCreateAccountMockHandler,
	getUpdateAccountMockHandler,
} from "../../../generated/api/account/accountService.msw.ts";
import { getListCourseReviewsMockHandler } from "../../../generated/api/anonymous-review/anonymousReviewService.msw.ts";
import {
	getGetCourseMockHandler,
	getListCoursesMockHandler,
} from "../../../generated/api/course/courseService.msw.ts";
import {
	getCreateReviewMockHandler,
	getGetReviewMockHandler,
	getListReviewsMockHandler,
} from "../../../generated/api/review/reviewService.msw.ts";
import {
	mockCreateReview,
	mockGetCourse,
	mockGetReview,
	mockGetSelf,
	mockListCourseReviews,
	mockListCourses,
	mockListReviews,
} from "./fixtures";

const handlers = [
	getListCoursesMockHandler(mockListCourses),
	getGetCourseMockHandler(mockGetCourse),
	getListCourseReviewsMockHandler(mockListCourseReviews),
	getListReviewsMockHandler(mockListReviews),
	getCreateReviewMockHandler(mockCreateReview),
	getGetReviewMockHandler(mockGetReview),
	getGetSelfMockHandler(mockGetSelf),
	getCreateAccountMockHandler(mockGetSelf),
	getUpdateAccountMockHandler(mockGetSelf),
];

const worker = setupWorker(...handlers);

async function unregisterMockServiceWorkers() {
	if (!("serviceWorker" in navigator)) return;
	const registrations = await navigator.serviceWorker.getRegistrations();
	await Promise.all(
		registrations
			.filter((registration) =>
				registration.active?.scriptURL.endsWith("/mockServiceWorker.js"),
			)
			.map((registration) => registration.unregister()),
	);
}

export async function initializeMocking(): Promise<void> {
	if (import.meta.env.VITE_API_MOCKING_ENABLED === "true") {
		await worker.start({ onUnhandledRequest: "bypass" });
		return;
	}

	await unregisterMockServiceWorkers();
}
