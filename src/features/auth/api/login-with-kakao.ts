import { api } from "@/shared/api/client";

import type { SessionResult } from "../model/auth";

export function loginWithKakao(code: string, redirectUri: string) {
	const body = { authToken: code, redirectUri, oAuthProvider: "KAKAO" };
	return api.post<SessionResult>("/api/auth/session", { json: body, auth: false });
}
