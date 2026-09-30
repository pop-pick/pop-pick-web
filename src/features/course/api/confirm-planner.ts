import { api } from "@/shared/api/client";

import { type PlannerResponse, toCourse } from "./get-planner";

export async function confirmPlanner(plannerId: number) {
	return toCourse(await api.post<PlannerResponse>(`/api/v1/planners/${String(plannerId)}/confirm`));
}
