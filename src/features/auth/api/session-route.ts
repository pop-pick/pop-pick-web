import { api } from "@/shared/api/client";
import { readBearerToken, toBackendErrorResponse, toSuccessResponse } from "@/shared/api/route-handler";

import type { AuthTokens, OAuthProvider } from "../model/auth";
import { clearRefreshCookie, readRefreshToken, setRefreshCookie } from "../model/session-cookie";

interface LoginBody {
	oAuthProvider: OAuthProvider;
	authToken: string;
	redirectUri: string;
}

export async function handleLogin(request: Request) {
	const body = (await request.json()) as LoginBody;

	try {
		const tokens = await api.post<AuthTokens>("/api/v1/auth/login", { json: body, auth: false });

		return setRefreshCookie(toSuccessResponse({ accessToken: tokens.accessToken }), tokens.refreshToken);
	} catch (error) {
		return toBackendErrorResponse(error);
	}
}

export async function handleLogout(request: Request) {
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
