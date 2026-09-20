import { api } from "@/shared/api/client";

import type { SessionResult } from "../model/auth";

/** 같은 출처 Route Handler를 부른다. 리프레시 토큰은 거기서 쿠키로 굽고 본문에 오지 않는다 */
export function loginWithKakao(code: string, redirectUri: string) {
	const body = { authToken: code, redirectUri, oAuthProvider: "KAKAO" };

	return api.post<SessionResult>("/api/auth/session", { json: body, auth: false });
}
