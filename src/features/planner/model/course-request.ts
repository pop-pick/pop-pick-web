import { z } from "zod";

import { getSeoulToday, parseDateOnly } from "@/shared/lib/date";
import {
	COMPANION_TYPES,
	type CompanionType,
	isCompanionType,
	isPartySize,
	isPreferredActivity,
	isTripDuration,
	PARTY_SIZES,
	type PartySize,
	PREFERRED_ACTIVITIES,
	type PreferredActivity,
	TRIP_DURATIONS,
	type TripDuration
} from "@/shared/model/trip-preference";

export const COURSE_NOTE_MAX_LENGTH = 200;

const FIRST_START_HOUR = 10;
const LAST_START_HOUR = 22;

export const COURSE_START_TIMES = Array.from(
	{ length: LAST_START_HOUR - FIRST_START_HOUR + 1 },
	(_, index) => `${String(FIRST_START_HOUR + index).padStart(2, "0")}:00`
);

export function formatStartTimeLabel(startAt: string) {
	return startAt;
}

/** 서버가 UTC로 돌아 오늘은 서울 기준으로 구한다 */
export function isSelectableCourseDate(date: string) {
	return parseDateOnly(date) !== null && date >= getSeoulToday();
}

export const courseRequestSchema = z.object({
	companion: z.enum(COMPANION_TYPES),
	partySize: z.literal(PARTY_SIZES),
	activities: z.array(z.enum(PREFERRED_ACTIVITIES)),
	date: z.string().refine(isSelectableCourseDate),
	startAt: z.string().refine((value) => COURSE_START_TIMES.includes(value)),
	duration: z.enum(TRIP_DURATIONS),
	note: z.string().max(COURSE_NOTE_MAX_LENGTH)
});

export interface CourseRequestDraft {
	companion: CompanionType | null;
	partySize: PartySize | null;
	activities: PreferredActivity[];
	/** "YYYY-MM-DD" */
	date: string | null;
	/** "HH:mm" */
	startAt: string | null;
	duration: TripDuration | null;
	note: string;
}

export type CourseRequest = z.infer<typeof courseRequestSchema>;

export const EMPTY_COURSE_REQUEST_DRAFT: CourseRequestDraft = {
	companion: null,
	partySize: null,
	activities: [],
	date: null,
	startAt: null,
	duration: null,
	note: ""
};

export function toCourseRequest(draft: CourseRequestDraft) {
	const result = courseRequestSchema.safeParse(draft);
	return result.success ? result.data : null;
}

export function parseCourseRequestDraft(searchParams: URLSearchParams) {
	const companion = searchParams.get("companion");
	const partySize = Number(searchParams.get("party"));
	const date = searchParams.get("date");
	const startAt = searchParams.get("start");
	const duration = searchParams.get("duration");

	return {
		companion: isCompanionType(companion) ? companion : null,
		partySize: isPartySize(partySize) ? partySize : null,
		activities: searchParams.getAll("activity").filter(isPreferredActivity),
		date: date !== null && isSelectableCourseDate(date) ? date : null,
		startAt: startAt !== null && COURSE_START_TIMES.includes(startAt) ? startAt : null,
		duration: isTripDuration(duration) ? duration : null,
		note: (searchParams.get("note") ?? "").slice(0, COURSE_NOTE_MAX_LENGTH)
	};
}

export function serializeCourseRequestDraft(draft: CourseRequestDraft) {
	const params = new URLSearchParams();

	if (draft.companion !== null) {
		params.set("companion", draft.companion);
	}

	if (draft.partySize !== null) {
		params.set("party", String(draft.partySize));
	}

	for (const activity of draft.activities) {
		params.append("activity", activity);
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
