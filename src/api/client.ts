// TODO: DEPRECATE THIS

import type {
	Curso,
	CursoListItem,
	Review,
	CourseFilters,
	PaginatedResponse,
	ReviewSort,
	ReviewSubmission,
	ReviewReaction,
} from "./types";
import { mockCourses, mockReviews, toCursoListItem } from "./mockData";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const PAGE_SIZE = 12;

export async function getCourses(
	filters: CourseFilters,
	cursor?: string,
): Promise<PaginatedResponse<CursoListItem>> {
	await delay(400);

	let courses = [...mockCourses];

	if (filters.q) {
		const q = filters.q.toLowerCase();
		courses = courses.filter(
			(c) =>
				c.name.toLowerCase().includes(q) ||
				c.code.toLowerCase().includes(q) ||
				c.description.toLowerCase().includes(q),
		);
	}

	if (filters.plan) {
		courses = courses.filter((c) => c.plan === filters.plan);
	}

	if (filters.tags && filters.tags.length > 0) {
		courses = courses.filter((c) =>
			filters.tags!.some((t) => c.categoryTags.includes(t)),
		);
	}

	if (filters.currentlyOffered !== undefined) {
		courses = courses.filter(
			(c) => c.currentlyOffered === filters.currentlyOffered,
		);
	}

	if (filters.semester) {
		courses = courses.filter((c) =>
			c.semesters.some((s) => `${s.year}-${s.semester}` === filters.semester),
		);
	}

	const avgRating = (c: Curso) => {
		const r = c.ratings;
		return (
			(r.docencia +
				r.relevancia +
				r.vibes -
				r.carga * 0.3 -
				r.dificultad * 0.3) /
			3
		);
	};

	switch (filters.sort) {
		case "rating":
			courses.sort((a, b) => avgRating(b) - avgRating(a));
			break;
		case "reviews":
			courses.sort((a, b) => b.reviewCount - a.reviewCount);
			break;
		case "recent":
			courses.sort((a, b) => b.lastOffered.localeCompare(a.lastOffered));
			break;
		case "alphabetical":
			courses.sort((a, b) => a.name.localeCompare(b.name, "es"));
			break;
		case "code":
			courses.sort((a, b) => a.code.localeCompare(b.code));
			break;
		default:
			courses.sort((a, b) => b.reviewCount - a.reviewCount);
	}

	const startIdx = cursor ? parseInt(cursor, 10) : 0;
	const slice = courses.slice(startIdx, startIdx + PAGE_SIZE);
	const nextIdx = startIdx + PAGE_SIZE;

	return {
		items: slice.map(toCursoListItem),
		nextCursor: nextIdx < courses.length ? String(nextIdx) : null,
		total: courses.length,
	};
}

export async function getCourseById(id: string): Promise<Curso | null> {
	await delay(300);
	return mockCourses.find((c) => c.id === id) ?? null;
}

export async function getCourseReviews(
	courseId: string,
	sort: ReviewSort = "newest",
	cursor?: string,
): Promise<PaginatedResponse<Review>> {
	await delay(350);

	const reviews = (mockReviews.get(courseId) ?? []).filter((r) => !r.hidden);
	const sorted = [...reviews];

	if (sort === "top") {
		sorted.sort((a, b) => b.likes - b.dislikes - (a.likes - a.dislikes));
	} else {
		sorted.sort(
			(a, b) =>
				new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
		);
	}

	const startIdx = cursor ? parseInt(cursor, 10) : 0;
	const slice = sorted.slice(startIdx, startIdx + 10);
	const nextIdx = startIdx + 10;

	return {
		items: slice,
		nextCursor: nextIdx < sorted.length ? String(nextIdx) : null,
		total: sorted.length,
	};
}

export async function postReview(data: ReviewSubmission): Promise<Review> {
	await delay(500);
	const review: Review = {
		id: Math.floor(Math.random() * 100000),
		...data,
		likes: 0,
		dislikes: 0,
		funny: 0,
		hidden: false,
		createdAt: new Date().toISOString(),
	};
	const existing = mockReviews.get(data.cursoId) ?? [];
	existing.unshift(review);
	mockReviews.set(data.cursoId, existing);

	const curso = mockCourses.find((c) => c.id === data.cursoId);
	if (curso) curso.reviewCount++;

	return review;
}

export async function reactToReview(
	reaction: ReviewReaction,
): Promise<Review | null> {
	await delay(200);
	for (const reviews of mockReviews.values()) {
		const review = reviews.find((r) => r.id === reaction.reviewId);
		if (review) {
			if (reaction.type === "like") review.likes++;
			else if (reaction.type === "dislike") review.dislikes++;
			else review.funny++;
			return { ...review };
		}
	}
	return null;
}

export async function getAdminReviews(
	cursor?: string,
): Promise<PaginatedResponse<Review & { courseName: string }>> {
	await delay(400);

	const allReviews: (Review & { courseName: string })[] = [];
	for (const curso of mockCourses) {
		const reviews = mockReviews.get(curso.id) ?? [];
		for (const r of reviews) {
			allReviews.push({ ...r, courseName: `${curso.code} — ${curso.name}` });
		}
	}
	allReviews.sort(
		(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
	);

	const startIdx = cursor ? parseInt(cursor, 10) : 0;
	const slice = allReviews.slice(startIdx, startIdx + 15);
	const nextIdx = startIdx + 15;

	return {
		items: slice,
		nextCursor: nextIdx < allReviews.length ? String(nextIdx) : null,
		total: allReviews.length,
	};
}

export async function hideReview(reviewId: number): Promise<boolean> {
	await delay(300);
	for (const reviews of mockReviews.values()) {
		const review = reviews.find((r) => r.id === reviewId);
		if (review) {
			review.hidden = !review.hidden;
			return true;
		}
	}
	return false;
}
