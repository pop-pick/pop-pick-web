import { ApiError } from "@/shared/api/errors";

const UNAVAILABLE_ERROR_CODES = new Set(["E3000", "E3001"]);
const STALE_COURSE_ERROR_CODES = new Set(["E3000", "E3001", "E3005"]);
const PAST_VISIT_DATE_ERROR_CODE = "E3002";

export function isCourseUnavailableError(error: unknown) {
	return error instanceof ApiError && error.errorCode !== null && UNAVAILABLE_ERROR_CODES.has(error.errorCode);
}

export function isStaleCourseError(error: unknown) {
	return error instanceof ApiError && error.errorCode !== null && STALE_COURSE_ERROR_CODES.has(error.errorCode);
}

export function isPastVisitDateError(error: unknown) {
	return error instanceof ApiError && error.errorCode === PAST_VISIT_DATE_ERROR_CODE;
}
