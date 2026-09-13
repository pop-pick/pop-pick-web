import { api } from "@/shared/api/client";

export interface AuthTokens {
	accessToken: string;
	refreshToken: string;
}

export function loginWithKakao(authToken: string, redirectUri: string) {
	return api.post<AuthTokens>("/api/v1/auth/login", {
		authToken,
		redirectUri,
		oauthProvider: "KAKAO"
	});
}

export function refreshTokens(refreshToken: string) {
	return api.post<AuthTokens>("/api/v1/auth/refresh", { refreshToken });
}

export async function logout(accessToken: string, refreshToken: string) {
	await api.post<null>(
		"/api/v1/auth/logout",
		{ refreshToken },
		{ headers: { authorization: `Bearer ${accessToken}` } }
	);
}
