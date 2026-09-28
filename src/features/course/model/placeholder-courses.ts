import { addMinutes, differenceInMinutes, format } from "date-fns";

import { getSeoulNow, parseTimeOnlyOrThrow, TIME_ONLY_FORMAT } from "@/shared/lib/date";

import type { Course } from "./course";

const SEONGSU_STOPS: Course["stops"] = [
	{
		order: 1,
		popupId: 1,
		title: "어글리 토이 팝업스토어",
		arriveAt: "14:00",
		address: "성동구 연무장길 15",
		waitMinutes: 10,
		description: null,
		position: { lat: 37.5433, lng: 127.056 }
	},
	{
		order: 2,
		popupId: 2,
		title: "치이카와 나가노 마켓",
		arriveAt: "15:30",
		address: "성동구 연무장길 2",
		waitMinutes: null,
		description: null,
		position: { lat: 37.5447, lng: 127.0539 }
	},
	{
		order: 3,
		popupId: 5,
		title: "모노에디션 성수갤러리 팝업",
		arriveAt: "17:00",
		address: null,
		waitMinutes: null,
		description: "디지털 미디어 아트 전시형 팝업",
		position: { lat: 37.5441, lng: 127.0572 }
	}
];

const SEONGSU_LEGS: Course["legs"] = [
	{ fromOrder: 1, minutes: 5, meters: 340 },
	{ fromOrder: 2, minutes: 8, meters: 500 }
];

export const PLACEHOLDER_GENERATED_COURSE_ID = 101;

const TEMPLATE_FIRST_ARRIVAL = "14:00";
const MINUTES_AFTER_LAST_ARRIVAL = 60;

interface GeneratedCourseOptions {
	/** "YYYY-MM-DD" */
	date: string;
	/** "HH:mm" */
	startAt: string;
	stopCount: number;
}

function parseTime(time: string) {
	return parseTimeOnlyOrThrow(time, getSeoulNow());
}

function shiftTime(time: string, minutes: number) {
	return format(addMinutes(parseTime(time), minutes), TIME_ONLY_FORMAT);
}

function countMinutesBetween(from: string, to: string) {
	return differenceInMinutes(parseTime(to), parseTime(from));
}

/** 코스 API가 없어 임시 성수 코스를 입력한 날짜와 시작 시각, 소요 시간에 맞춰 옮긴다 */
export function buildGeneratedCourse({ date, startAt, stopCount }: GeneratedCourseOptions) {
	const offsetMinutes = countMinutesBetween(TEMPLATE_FIRST_ARRIVAL, startAt);
	const stops = SEONGSU_STOPS.slice(0, stopCount).map((stop) => ({
		...stop,
		arriveAt: shiftTime(stop.arriveAt, offsetMinutes)
	}));
	const lastArrival = stops.at(-1)?.arriveAt ?? startAt;

	return {
		id: PLACEHOLDER_GENERATED_COURSE_ID,
		title: "성수동 가을 감성 추천 데이트 코스",
		regionLabel: "성수동",
		date,
		startAt,
		endAt: shiftTime(lastArrival, MINUTES_AFTER_LAST_ARRIVAL),
		stops,
		legs: SEONGSU_LEGS.filter((leg) => leg.fromOrder < stops.length),
		savedAt: null,
		cancelledAt: null
	};
}
