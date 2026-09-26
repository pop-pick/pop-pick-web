import { ApiError } from "@/shared/api/errors";

const REJECTED_CODES = new Set(["E1011", "E1000"]);

export function isRejectedToken(error: unknown) {
	if (!(error instanceof ApiError)) {
		return false;
	}

	return error.status === 401 || (error.errorCode !== null && REJECTED_CODES.has(error.errorCode));
}
