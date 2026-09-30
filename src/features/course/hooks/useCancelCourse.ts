import { useMutation, useQueryClient } from "@tanstack/react-query";

import { cancelPlanner } from "../api/cancel-planner";
import { courseDetailQueryOptions } from "../api/get-planner";

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
		}
	});
}
