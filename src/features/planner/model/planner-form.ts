import type { PlannerDraft } from "@/shared/model/planner-path";

export interface PlannerOption {
	id: number;
	label: string;
}

export interface PlannerFormData {
	defaults: Pick<PlannerDraft, "areaId" | "categoryIds" | "activityIds">;
	areas: PlannerOption[];
	categories: PlannerOption[];
	activities: PlannerOption[];
	/** "yyyy-MM-dd" */
	minDate: string;
	/** "yyyy-MM-dd" */
	maxDate: string;
	/** "HH:mm", 한 시간 간격 */
	startTimes: string[];
}

export const PLANNER_FORM_TITLE = "취향 분석 온보딩";

export function toggleOptionId(options: PlannerOption[], selectedIds: number[], id: number) {
	return options.filter((option) => (option.id === id) !== selectedIds.includes(option.id)).map((option) => option.id);
}

export function toChoiceOptions(options: PlannerOption[]) {
	return options.map(({ id, label }) => ({ value: id, label }));
}
