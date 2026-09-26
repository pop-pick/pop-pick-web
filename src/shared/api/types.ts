export type ResultType = "SUCCESS" | "ERROR";

export interface ErrorMessage {
	errorCode: string;
	message: string;
	data: unknown;
}

export interface ApiResponse<T> {
	resultType: ResultType;
	data: T | null;
	error: ErrorMessage | null;
}

export interface PageResponse<T> {
	content: T[];
	hasNext: boolean;
}

function hasErrorMessageShape(error: unknown) {
	if (typeof error !== "object" || error === null) {
		return false;
	}

	const { errorCode, message } = error as Record<string, unknown>;

	return typeof errorCode === "string" && typeof message === "string" && "data" in error;
}

export function isApiResponse(body: unknown): body is ApiResponse<unknown> {
	if (typeof body !== "object" || body === null) {
		return false;
	}

	const { resultType, error } = body as Record<string, unknown>;
	const hasResultType = resultType === "SUCCESS" || resultType === "ERROR";
	const hasError = error === null || hasErrorMessageShape(error);

	return hasResultType && "data" in body && hasError;
}
