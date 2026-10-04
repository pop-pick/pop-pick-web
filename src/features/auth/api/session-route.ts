import { api } from "@/shared/api/client";
import {
	readBearerToken,
	toBackendErrorResponse,
	toErrorResponse,
	toSuccessResponse
} from "@/shared/api/route-handler";

import type { AuthTokens, LoginBody } from "../model/auth";
import { clearRefreshCookie, readRefreshToken, setRefreshCookie } from "../model/session-cookie";

async function readLoginBodyOrNull(request: Request) {
	try {
		return (await request.json()) as LoginBody;
	} catch (error) {
		console.warn("[auth] 로그인 요청 본문을 읽지 못했습니다", error);
		return null;
	}
}

export async function postSession(request: Request) {
	const body = await readLoginBodyOrNull(request);

	if (body === null) {
		return toErrorResponse({ status: 400, errorCode: "E400", message: "요청 값이 올바르지 않습니다." });
	}

	try {
		const tokens = await api.post<AuthTokens>("/api/v1/auth/login", { json: body, auth: false });
		return setRefreshCookie(toSuccessResponse({ accessToken: tokens.accessToken }), tokens.refreshToken);
	} catch (error) {
		return toBackendErrorResponse(error);
	}
}

export async function deleteSession(request: Request) {
	const refreshToken = await readRefreshToken();
	const response = clearRefreshCookie(toSuccessResponse(null));

	if (refreshToken === null) {
		return response;
	}

	const accessToken = readBearerToken(request);

	try {
		await api.post<null>("/api/v1/auth/logout", {
			json: { refreshToken },
			auth: false,
			accessToken: accessToken ?? undefined
		});
	} catch (error) {
		console.warn("[auth] 백엔드 로그아웃 요청이 실패했습니다", error);
	}

	return response;
}
