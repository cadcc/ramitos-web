import { http, HttpResponse } from "msw";
import {
	getGetSelfMockHandler,
	getCreateAccountMockHandler,
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
	mockCreateAccount,
	mockUpdateAccount,
	mockPasswordLogin,
	mockDccLogin,
} from "./fixtures";

export const handlers = [
	getGetCoursesStaticDataMockHandler(mockGetCoursesStaticData),
	getListCoursesMockHandler(mockListCourses),
	getGetCourseMockHandler(mockGetCourse),
	getListCourseReviewsMockHandler(mockListCourseReviews),
	getListReviewsMockHandler(mockListReviews),
	getCreateReviewMockHandler(mockCreateReview),
	getGetReviewMockHandler(mockGetReview),
	getGetSelfMockHandler(mockGetSelf),
	getCreateAccountMockHandler(mockCreateAccount),
	http.patch("*/api/accounts/:userId", async (info) => {
		const account = await mockUpdateAccount(info);
		return account
			? HttpResponse.json(account)
			: new HttpResponse(null, { status: 404 });
	}),
	http.post("*/api/workflow/login/pass", async (info) => {
		const token = await mockPasswordLogin(info);
		return token
			? HttpResponse.json(token)
			: new HttpResponse(null, { status: 400 });
	}),
	http.post("*/api/workflow/login/dcc/finish", async ({ request }) => {
		const body = (await request.json()) as { secret?: string };
		return body.secret === "ramitos-mock-dcc"
			? HttpResponse.json(mockDccLogin())
			: new HttpResponse(null, { status: 400 });
	}),
];
