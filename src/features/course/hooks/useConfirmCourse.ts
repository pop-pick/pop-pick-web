import { useMutation, useQueryClient } from "@tanstack/react-query";

import { confirmPlanner } from "../api/confirm-planner";
import { courseDetailQueryOptions } from "../api/get-planner";

export function useConfirmCourse() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: confirmPlanner,
		onSuccess: async (course) => {
			queryClient.setQueryData(courseDetailQueryOptions(course.id).queryKey, course);
			await queryClient.invalidateQueries({ queryKey: ["course", "list"] });
		}
	});
}
