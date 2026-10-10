import { setupWorker } from "msw/browser";
import {
	getGetSelfMockHandler,
	getCreateAccountMockHandler,
	getUpdateAccountMockHandler,
} from "../../../generated/api/account/accountService.msw.ts";
import { getListCourseReviewsMockHandler } from "../../../generated/api/anonymous-review/anonymousReviewService.msw.ts";
import {
	getGetCourseMockHandler,
	getGetCoursesStaticDataMockHandler,
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
	mockGetCoursesStaticData,
	mockGetReview,
	mockGetSelf,
	mockListCourseReviews,
	mockListCourses,
	mockListReviews,
} from "./fixtures";

const handlers = [
	getGetCoursesStaticDataMockHandler(mockGetCoursesStaticData),
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

export async function startMocking(): Promise<void> {
	await worker.start({ onUnhandledRequest: "bypass" });
}
