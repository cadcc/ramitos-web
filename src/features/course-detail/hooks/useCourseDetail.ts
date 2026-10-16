import { useAuth } from "../../auth";
import { useQuery } from "@tanstack/react-query";
import { getCourseDetail } from "../api/courseDetail.api";

export function useCourseDetail(cursoId: string) {
	const { user, isAuthenticated, status } = useAuth();
	return useQuery({
		enabled: status !== "checking",
		queryKey: ["course", cursoId, isAuthenticated ? user?.id : null],
		queryFn: () => getCourseDetail(cursoId, isAuthenticated),
	});
}
