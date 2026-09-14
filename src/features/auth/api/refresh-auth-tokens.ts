import { api } from "@/shared/api/client";

import type { AuthTokens } from "../model/auth";

export function refreshAuthTokens(refreshToken: string) {
	return api.post<AuthTokens>("/api/v1/auth/refresh", { json: { refreshToken }, auth: false });
}
