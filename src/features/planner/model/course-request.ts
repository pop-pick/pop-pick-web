import { addDays, addMinutes, format } from "date-fns";

import { DATE_ONLY_FORMAT, parseDateOnlyOrThrow, TIME_ONLY_FORMAT } from "@/shared/lib/date";
import { EMPTY_PLANNER_DRAFT, type PlannerDraft } from "@/shared/model/planner-path";
import type { CompanionType, TripDuration } from "@/shared/model/trip-preference";

import type { PlannerFormData, PlannerOption } from "./planner-form";

export interface GeneratePlannerRequest {
	areaId: number;
	/** "yyyy-MM-dd" */
	visitDate: string;
	/** "HH:mm" */
	startTime: string;
	accompanyType: CompanionType;
	durationType: TripDuration;
	interestCategoryIds: number[];
	preferredActivityIds: number[];
	note: string | null;
}

const TODAY_LEAD_MINUTES = 30;

function hasOption(options: PlannerOption[], id: number | null) {
	return id !== null && options.some((option) => option.id === id);
}

function keepKnownIds(options: PlannerOption[], ids: number[]) {
	return options.filter((option) => ids.includes(option.id)).map((option) => option.id);
}

/** 오늘 방문이면 서버가 지금부터 30분 뒤보다 이른 시작 시각을 거절한다. now는 서울 기준 시각이다 */
export function getSelectableStartTimes(form: PlannerFormData, date: string | null, now: Date) {
	if (date !== format(now, DATE_ONLY_FORMAT)) {
		return form.startTimes;
	}

	const earliest = addMinutes(now, TODAY_LEAD_MINUTES);

	if (format(earliest, DATE_ONLY_FORMAT) !== date) {
		return [];
	}

	const earliestTime = format(earliest, TIME_ONLY_FORMAT);

	return form.startTimes.filter((time) => time >= earliestTime);
}

export function getSelectableDateRange(form: PlannerFormData, now: Date) {
	const hasStartTimeOnFirstDate = getSelectableStartTimes(form, form.minDate, now).length > 0;
	const minDate = hasStartTimeOnFirstDate
		? form.minDate
		: format(addDays(parseDateOnlyOrThrow(form.minDate), 1), DATE_ONLY_FORMAT);

	return { minDate, maxDate: form.maxDate };
}

export function sanitizePlannerDraft(draft: PlannerDraft, form: PlannerFormData, now: Date) {
	const { minDate, maxDate } = getSelectableDateRange(form, now);
	const date = draft.date !== null && draft.date >= minDate && draft.date <= maxDate ? draft.date : null;
	const sanitized: PlannerDraft = {
		...draft,
		areaId: hasOption(form.areas, draft.areaId) ? draft.areaId : null,
		categoryIds: keepKnownIds(form.categories, draft.categoryIds),
		activityIds: keepKnownIds(form.activities, draft.activityIds),
		date,
		startAt:
			draft.startAt !== null && getSelectableStartTimes(form, date, now).includes(draft.startAt) ? draft.startAt : null
	};

	return sanitized;
}

export function buildInitialPlannerDraft(urlDraft: PlannerDraft, hasQuery: boolean, form: PlannerFormData, now: Date) {
	const draft = hasQuery ? urlDraft : { ...EMPTY_PLANNER_DRAFT, ...form.defaults };
	return sanitizePlannerDraft(draft, form, now);
}

export function toGeneratePlannerRequest(draft: PlannerDraft, form: PlannerFormData, now: Date) {
	const { areaId, companion, date, startAt, duration } = sanitizePlannerDraft(draft, form, now);

	if (areaId === null || companion === null || date === null || startAt === null || duration === null) {
		return null;
	}

	const note = draft.note.trim();
	const request: GeneratePlannerRequest = {
		areaId,
		visitDate: date,
		startTime: startAt,
		accompanyType: companion,
		durationType: duration,
		interestCategoryIds: draft.categoryIds,
		preferredActivityIds: draft.activityIds,
		note: note === "" ? null : note
	};

	return request;
}
