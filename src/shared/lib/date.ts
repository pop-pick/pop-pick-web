import { TZDate } from "@date-fns/tz";
import { format, isValid, parse } from "date-fns";

export const SEOUL_TIME_ZONE = "Asia/Seoul";

export const DATE_ONLY_FORMAT = "yyyy-MM-dd";

export const TIME_ONLY_FORMAT = "HH:mm";

/** 서버가 UTC로 돌아 오늘과 현재 시각은 서울 시간대로 구한다 */
export function getSeoulNow() {
	return TZDate.tz(SEOUL_TIME_ZONE);
}

export function getSeoulToday() {
	return format(getSeoulNow(), DATE_ONLY_FORMAT);
}

/** date-fns의 parse는 "2026-2-3"도 받아 준다. 다시 포맷해 원문과 같을 때만 날짜로 본다. 달력에 없는 날짜(2026-02-31)도 null이다 */
export function parseDateOnly(value: string) {
	const parsed = parse(value, DATE_ONLY_FORMAT, getSeoulNow());
	return isValid(parsed) && format(parsed, DATE_ONLY_FORMAT) === value ? parsed : null;
}

export function parseDateOnlyOrThrow(value: string) {
	const parsed = parseDateOnly(value);

	if (parsed === null) {
		throw new Error(`[date] yyyy-MM-dd 형식이 아닌 날짜다: ${value}`);
	}

	return parsed;
}

/** 날짜 없이 온 "HH:mm"을 baseDate의 그 시각으로 읽는다. 원문과 다시 맞춰 보는 까닭은 parseDateOnly와 같다 */
export function parseTimeOnlyOrThrow(value: string, baseDate: Date) {
	const parsed = parse(value, TIME_ONLY_FORMAT, baseDate);

	if (!isValid(parsed) || format(parsed, TIME_ONLY_FORMAT) !== value) {
		throw new Error(`[date] HH:mm 형식이 아닌 시각이다: ${value}`);
	}

	return parsed;
}
