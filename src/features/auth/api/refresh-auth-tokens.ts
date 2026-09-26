import { api } from "@/shared/api/client";

import type { SessionResult } from "../model/auth";

export function refreshAuthTokens() {
	return api.post<SessionResult>("/api/auth/refresh", { auth: false });
}
