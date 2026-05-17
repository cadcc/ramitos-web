import { useQuery } from "@tanstack/react-query";
import { getCourseDetail } from "../api/courseDetail.api";

export function useCourseDetail(cursoId: string) {
	return useQuery({
		queryKey: ["course", cursoId],
		queryFn: () => getCourseDetail(cursoId),
	});
}
