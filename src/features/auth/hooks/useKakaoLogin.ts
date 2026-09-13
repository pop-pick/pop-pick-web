import { skipToken, useQuery } from "@tanstack/react-query";

import { loginWithKakao } from "../api/auth";
import { getKakaoRedirectUri } from "../lib/kakao-oauth";
import { consumeNextPath } from "../lib/next-path";
import { verifyOAuthState } from "../lib/oauth-state";
import { useAuthStore } from "../store/useAuthStore";

interface KakaoCallbackParams {
	code: string | null;
	state: string | null;
}

async function exchangeCodeForTokens(code: string, state: string | null) {
	try {
		verifyOAuthState(state);
		const tokens = await loginWithKakao(code, getKakaoRedirectUri());
		useAuthStore.getState().setTokens(tokens);
		return { tokens, nextPath: consumeNextPath() };
	} catch (error) {
		console.error("[auth] 카카오 로그인 실패", error);
		throw error;
	}
}

/** useEffect 안에서 mutate를 부르면 StrictMode가 일회용 인가 코드로 교환을 두 번 보낸다 */
export function useKakaoLogin({ code, state }: KakaoCallbackParams) {
	return useQuery({
		queryKey: ["auth", "kakao-login", code, state],
		queryFn: code === null ? skipToken : () => exchangeCodeForTokens(code, state),
		retry: false,
		staleTime: Infinity
	});
}
