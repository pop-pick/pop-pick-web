import { parseDateOnly } from "@/shared/lib/date";

import { type CompanionType, isCompanionType, isTripDuration, type TripDuration } from "./trip-preference";

export const PLANNER_PATH = "/planner";

export const PLANNER_NEW_PATH = "/planner/new";

export const PLANNER_NOTE_MAX_LENGTH = 200;

export interface PlannerDraft {
	areaId: number | null;
	companion: CompanionType | null;
	categoryIds: number[];
	activityIds: number[];
	/** "yyyy-MM-dd" */
	date: string | null;
	/** "HH:mm" */
	startAt: string | null;
	duration: TripDuration | null;
	note: string;
}

export const EMPTY_PLANNER_DRAFT: PlannerDraft = {
	areaId: null,
	companion: null,
	categoryIds: [],
	activityIds: [],
	date: null,
	startAt: null,
	duration: null,
	note: ""
};

const ID_PATTERN = /^[1-9]\d{0,8}$/;
const TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

function parseId(value: string | null) {
	return value !== null && ID_PATTERN.test(value) ? Number(value) : null;
}

function parseIds(values: string[]) {
	return [...new Set(values.map(parseId).filter((id) => id !== null))];
}

export function parsePlannerDraft(searchParams: URLSearchParams) {
	const date = searchParams.get("date");
	const startAt = searchParams.get("start");
	const companion = searchParams.get("companion");
	const duration = searchParams.get("duration");
	const draft: PlannerDraft = {
		areaId: parseId(searchParams.get("area")),
		companion: isCompanionType(companion) ? companion : null,
		categoryIds: parseIds(searchParams.getAll("category")),
		activityIds: parseIds(searchParams.getAll("activity")),
		date: date !== null && parseDateOnly(date) !== null ? date : null,
		startAt: startAt !== null && TIME_PATTERN.test(startAt) ? startAt : null,
		duration: isTripDuration(duration) ? duration : null,
		note: (searchParams.get("note") ?? "").slice(0, PLANNER_NOTE_MAX_LENGTH)
	};

	return draft;
}

export function serializePlannerDraft(draft: PlannerDraft) {
	const params = new URLSearchParams();

	if (draft.areaId !== null) {
		params.set("area", String(draft.areaId));
	}

	if (draft.companion !== null) {
		params.set("companion", draft.companion);
	}

	for (const categoryId of draft.categoryIds) {
		params.append("category", String(categoryId));
	}

	for (const activityId of draft.activityIds) {
		params.append("activity", String(activityId));
	}

	if (draft.date !== null) {
		params.set("date", draft.date);
	}

	if (draft.startAt !== null) {
		params.set("start", draft.startAt);
	}

	if (draft.duration !== null) {
		params.set("duration", draft.duration);
	}

	if (draft.note !== "") {
		params.set("note", draft.note);
	}

	return params;
}

export function buildPlannerNewPath(draft: PlannerDraft) {
	const query = serializePlannerDraft(draft).toString();
	return query === "" ? PLANNER_NEW_PATH : `${PLANNER_NEW_PATH}?${query}`;
}
