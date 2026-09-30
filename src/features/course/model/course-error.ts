import { ApiError } from "@/shared/api/errors";

const UNAVAILABLE_ERROR_CODES = new Set(["E3000", "E3001"]);
const PAST_VISIT_DATE_ERROR_CODE = "E3002";

export function isCourseUnavailableError(error: unknown) {
	return error instanceof ApiError && error.errorCode !== null && UNAVAILABLE_ERROR_CODES.has(error.errorCode);
}

export function isPastVisitDateError(error: unknown) {
	return error instanceof ApiError && error.errorCode === PAST_VISIT_DATE_ERROR_CODE;
}
