import { useMutation, useQueryClient } from "@tanstack/react-query";

import { cancelPlanner } from "../api/cancel-planner";
import { courseDetailQueryOptions } from "../api/get-planner";
import { isStaleCourseError } from "../model/course-error";

export function useCancelCourse() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: cancelPlanner,
		onSuccess: async (_, courseId) => {
			await queryClient.invalidateQueries({
				queryKey: courseDetailQueryOptions(courseId).queryKey,
				refetchType: "none"
			});
			await queryClient.invalidateQueries({ queryKey: ["course", "list"] });
		},
		onError: async (error, courseId) => {
			if (isStaleCourseError(error)) {
				await queryClient.invalidateQueries({ queryKey: courseDetailQueryOptions(courseId).queryKey });
			}
		}
	});
}
