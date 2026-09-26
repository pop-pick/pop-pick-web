import { api } from "@/shared/api/client";
import { toBackendErrorResponse, toErrorResponse, toSuccessResponse } from "@/shared/api/route-handler";

import type { AuthTokens } from "../model/auth";
import { clearRefreshCookie, readRefreshToken, setRefreshCookie } from "../model/session-cookie";
import { isRejectedToken } from "../model/session-rejection";

export async function handleRefresh() {
	const refreshToken = await readRefreshToken();

	if (refreshToken === null) {
		return toErrorResponse({ status: 401, errorCode: "E1000", message: "세션이 없습니다" });
	}

	try {
		const tokens = await api.post<AuthTokens>("/api/v1/auth/refresh", { json: { refreshToken }, auth: false });
		return setRefreshCookie(toSuccessResponse({ accessToken: tokens.accessToken }), tokens.refreshToken);
	} catch (error) {
		const response = toBackendErrorResponse(error);
		return isRejectedToken(error) ? clearRefreshCookie(response) : response;
	}
}
