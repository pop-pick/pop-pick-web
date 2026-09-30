import { useMutation } from "@tanstack/react-query";

import { generatePlanner } from "../api/generate-planner";
import type { GeneratePlannerRequest } from "../model/course-request";

interface GeneratePlannerVariables {
	request: GeneratePlannerRequest;
	signal: AbortSignal;
}

export function useGeneratePlanner() {
	return useMutation({
		mutationFn: ({ request, signal }: GeneratePlannerVariables) => generatePlanner(request, signal)
	});
}
