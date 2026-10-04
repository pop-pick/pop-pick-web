import { ApiError } from "@/shared/api/errors";

const REJECTED_CODES = new Set(["E1011", "E1000", "E1002", "E1003", "E1005", "E1006", "E1007", "E1008"]);

export function isTokenRejectedError(error: unknown) {
	if (!(error instanceof ApiError)) {
		return false;
	}

	return error.status === 401 || (error.errorCode !== null && REJECTED_CODES.has(error.errorCode));
}
