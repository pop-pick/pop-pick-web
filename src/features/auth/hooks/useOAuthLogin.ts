import { skipToken, useQuery } from "@tanstack/react-query";

import { loginWithOAuth } from "../api/login-with-oauth";
import type { OAuthProvider } from "../model/auth";
import { consumeNextPath } from "../model/next-path";
import { buildOAuthRedirectUri, getOAuthProviderDisplayName } from "../model/oauth-provider";
import { verifyOAuthState } from "../model/oauth-state";
import { useAuthStore } from "../model/useAuthStore";

interface OAuthCallbackParams {
	code: string | null;
	state: string | null;
}

async function exchangeCodeForSession(provider: OAuthProvider, code: string, state: string | null) {
	try {
		verifyOAuthState(state);
		const { accessToken } = await loginWithOAuth(provider, code, buildOAuthRedirectUri(provider));
		useAuthStore.getState().setAccessToken(accessToken);

		return { nextPath: consumeNextPath() };
	} catch (error) {
		console.error(`[auth] ${getOAuthProviderDisplayName(provider)} 로그인 실패`, error);
		throw error;
	}
}

/** useEffect 안에서 mutate를 부르면 StrictMode가 일회용 인가 코드로 교환을 두 번 보낸다 */
export function useOAuthLogin(provider: OAuthProvider, { code, state }: OAuthCallbackParams) {
	return useQuery({
		queryKey: ["auth", "oauth-login", provider, code, state],
		queryFn: code === null ? skipToken : () => exchangeCodeForSession(provider, code, state),
		retry: false,
		staleTime: Infinity
	});
}
