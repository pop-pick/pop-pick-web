import { api } from "@/shared/api/client";

import type { LoginBody, OAuthProvider, SessionResult } from "../model/auth";

export function loginWithOAuth(provider: OAuthProvider, code: string, redirectUri: string) {
	const body: LoginBody = { authToken: code, redirectUri, oAuthProvider: provider };
	return api.post<SessionResult>("/api/auth/session", { json: body, auth: false });
}
