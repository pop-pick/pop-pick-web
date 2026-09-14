import { api } from "@/shared/api/client";

import type { AuthTokens } from "../model/auth";

export function loginWithKakao(authToken: string, redirectUri: string) {
	const body = { authToken, redirectUri, oAuthProvider: "KAKAO" };
	return api.post<AuthTokens>("/api/v1/auth/login", { json: body, auth: false });
}
