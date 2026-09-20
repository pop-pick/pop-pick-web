import { api } from "@/shared/api/client";

import type { AuthTokens } from "../model/auth";

export function loginWithKakao(code: string, redirectUri: string) {
	const body = { authToken: code, redirectUri, oAuthProvider: "KAKAO" };
	return api.post<AuthTokens>("/api/v1/auth/login", { json: body, auth: false });
}
