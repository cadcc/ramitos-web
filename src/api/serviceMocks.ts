import { setupWorker } from "msw/browser";
import {
	getGetSelfMockHandler,
	getCreateAccountMockHandler,
	getUpdateAccountMockHandler,
} from "./account/accountService.msw.ts";
import { getListCourseReviewsMockHandler } from "./anonymous-review/anonymousReviewService.msw.ts";
import {
	getDccLoginMockHandler,
	getPasswordLoginMockHandler,
} from "./authentication/authenticationService.msw.ts";
import {
	getGetCourseMockHandler,
	getListCoursesMockHandler,
} from "./course/courseService.msw.ts";
import {
	getCreateReviewMockHandler,
	getGetReviewMockHandler,
	getListReviewsMockHandler,
} from "./review/reviewService.msw.ts";
import {
	mockCreateReview,
	mockGetCourse,
	mockGetReview,
	mockGetSelf,
	mockListCourseReviews,
	mockListCourses,
	mockListReviews,
	mockPasswordLogin,
} from "./mswFixtures";

const handlers = [
	getListCoursesMockHandler(mockListCourses),
	getGetCourseMockHandler(mockGetCourse),
	getListCourseReviewsMockHandler(mockListCourseReviews),
	getListReviewsMockHandler(mockListReviews),
	getCreateReviewMockHandler(mockCreateReview),
	getGetReviewMockHandler(mockGetReview),
	getPasswordLoginMockHandler(mockPasswordLogin),
	getDccLoginMockHandler(mockPasswordLogin),
	getGetSelfMockHandler(mockGetSelf),
	getCreateAccountMockHandler(mockGetSelf),
	getUpdateAccountMockHandler(mockGetSelf),
];

const worker = setupWorker(...handlers);

export async function initializeMocking() {
	return import.meta.env.VITE_API_MOCKING_ENABLED === "true"
		? worker.start()
		: null;
}
