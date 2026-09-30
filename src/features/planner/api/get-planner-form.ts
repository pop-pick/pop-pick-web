import { queryOptions } from "@tanstack/react-query";

import { api } from "@/shared/api/client";

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

const MINUTES_PER_HOUR = 60;

function toMinutes(time: string) {
	const [hours = 0, minutes = 0] = time.split(":").map(Number);
	return hours * MINUTES_PER_HOUR + minutes;
}

function toTime(totalMinutes: number) {
	const hours = Math.floor(totalMinutes / MINUTES_PER_HOUR);
	const minutes = totalMinutes % MINUTES_PER_HOUR;
	return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function toHourlyTimes(min: string, max: string) {
	const times: string[] = [];

	for (let minutes = toMinutes(min); minutes <= toMinutes(max); minutes += MINUTES_PER_HOUR) {
		times.push(toTime(minutes));
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
