import { api } from "@/shared/api/client";

export async function cancelPlanner(plannerId: number) {
	await api.delete<null>(`/api/v1/planners/${String(plannerId)}`);
}
