import { api } from "@/shared/api/client";

import type { SessionResult } from "../model/auth";

/** 쿠키의 리프레시 토큰으로 액세스 토큰을 다시 받는다. 요청 본문이 없다 */
export function refreshAuthTokens() {
	return api.post<SessionResult>("/api/auth/refresh", { auth: false });
}
