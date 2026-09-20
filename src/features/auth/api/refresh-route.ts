import { api } from "@/shared/api/client";
import { ApiError } from "@/shared/api/errors";
import { toBackendErrorResponse, toErrorResponse, toSuccessResponse } from "@/shared/api/route-handler";

import type { AuthTokens } from "../model/auth";
import { clearRefreshCookie, readRefreshToken, setRefreshCookie } from "../model/session-cookie";

/** 리프레시 토큰 자체가 못 쓰게 된 실패. 서버 장애와 갈라야 멀쩡한 쿠키를 지우지 않는다 */
const REJECTED_CODES = new Set(["E1011", "E1000"]);

function isRejectedToken(error: unknown) {
	if (!(error instanceof ApiError)) {
		return false;
	}

	return error.status === 401 || (error.errorCode !== null && REJECTED_CODES.has(error.errorCode));
}

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
