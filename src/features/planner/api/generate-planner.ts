import { api } from "@/shared/api/client";

import type { GeneratePlannerRequest } from "../model/course-request";

const GENERATE_TIMEOUT_MS = 30_000;

interface GeneratedPlannerResponse {
	plannerId: number;
}

export function generatePlanner(request: GeneratePlannerRequest, signal?: AbortSignal) {
	return api.post<GeneratedPlannerResponse>("/api/v1/planners/generate", {
		json: request,
		signal,
		timeoutMs: GENERATE_TIMEOUT_MS
	});
}
