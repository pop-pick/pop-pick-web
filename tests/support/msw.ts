import { HttpResponse } from "msw";
import { setupServer } from "msw/node";

import type { ApiResponse } from "@/shared/api/types";

export const server = setupServer();

export function apiSuccess<T>(data: T, init?: ResponseInit) {
	return HttpResponse.json<ApiResponse<T>>({ resultType: "SUCCESS", data, error: null }, init);
}

export function apiError(status: number, errorCode: string, message = errorCode) {
	return HttpResponse.json<ApiResponse<null>>(
		{ resultType: "ERROR", data: null, error: { errorCode, message, data: null } },
		{ status }
	);
}
