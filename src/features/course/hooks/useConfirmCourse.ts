import { useMutation, useQueryClient } from "@tanstack/react-query";

import { confirmPlanner } from "../api/confirm-planner";
import { courseDetailQueryOptions } from "../api/get-planner";
import { isStaleCourseError } from "../model/course-error";

export function useConfirmCourse() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: confirmPlanner,
		onSuccess: async (course) => {
			queryClient.setQueryData(courseDetailQueryOptions(course.id).queryKey, course);
			await queryClient.invalidateQueries({ queryKey: ["course", "list"] });
		},
		onError: async (error, courseId) => {
			if (isStaleCourseError(error)) {
				await queryClient.invalidateQueries({ queryKey: courseDetailQueryOptions(courseId).queryKey });
			}
		}
	});
}
