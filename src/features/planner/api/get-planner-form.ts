import { queryOptions } from "@tanstack/react-query";
import { addHours, format } from "date-fns";

import { api } from "@/shared/api/client";
import { getSeoulNow, parseTimeOnlyOrThrow, TIME_ONLY_FORMAT } from "@/shared/lib/date";

import type { PlannerFormData } from "../model/planner-form";

interface IdNameResponse {
	id: number;
	name: string;
}

interface PlannerFormResponse {
	defaults: {
		areaId: number | null;
		interestCategoryIds: number[];
		preferredActivityIds: number[];
	};
	options: {
		areas: IdNameResponse[];
		interestCategories: IdNameResponse[];
		preferredActivities: IdNameResponse[];
	};
	visitDateRange: { min: string; max: string };
	startTimeRange: { min: string; max: string };
}

function toHourlyTimes(min: string, max: string) {
	const baseDate = getSeoulNow();
	const end = parseTimeOnlyOrThrow(max, baseDate);
	const times: string[] = [];

	for (let time = parseTimeOnlyOrThrow(min, baseDate); time <= end; time = addHours(time, 1)) {
		times.push(format(time, TIME_ONLY_FORMAT));
	}

	return times;
}

function toOptions(items: IdNameResponse[]) {
	return items.map((item) => ({ id: item.id, label: item.name }));
}

function toPlannerFormData(form: PlannerFormResponse) {
	const data: PlannerFormData = {
		defaults: {
			areaId: form.defaults.areaId,
			categoryIds: form.defaults.interestCategoryIds,
			activityIds: form.defaults.preferredActivityIds
		},
		areas: toOptions(form.options.areas),
		categories: toOptions(form.options.interestCategories),
		activities: toOptions(form.options.preferredActivities),
		minDate: form.visitDateRange.min,
		maxDate: form.visitDateRange.max,
		startTimes: toHourlyTimes(form.startTimeRange.min, form.startTimeRange.max)
	};

	return data;
}

export function getPlannerForm(signal?: AbortSignal) {
	return api.get<PlannerFormResponse>("/api/v1/planners/form", { signal });
}

export function plannerFormQueryOptions() {
	return queryOptions({
		queryKey: ["planner", "form"],
		queryFn: async ({ signal }) => toPlannerFormData(await getPlannerForm(signal)),
		gcTime: 0
	});
}
