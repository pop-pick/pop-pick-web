import { api } from "@/shared/api/client";

import type { SessionResult } from "../model/auth";

export function refreshSession() {
	return api.post<SessionResult>("/api/auth/refresh", { auth: false });
}
