import { skipToken, useQuery } from "@tanstack/react-query";

import { loginWithKakao } from "../api/auth";
import { getKakaoRedirectUri } from "../lib/kakao-oauth";
import { useAuthStore } from "../store/useAuthStore";

async function exchangeCodeForTokens(code: string) {
	const tokens = await loginWithKakao(code, getKakaoRedirectUri());
	useAuthStore.getState().setTokens(tokens);
	return tokens;
}

/**
 * 인가 코드 교환을 mutation이 아니라 코드를 키로 하는 query로 다룬다.
 * 같은 키의 쿼리는 진행 중인 요청을 공유하므로 StrictMode가 마운트를 두 번 돌려도
 * POST는 한 번만 나간다. 카카오 인가 코드는 한 번만 교환할 수 있어 재시도하지 않고
 * 결과를 다시 조회하지도 않는다. useEffect에서 mutate를 부르면 두 번 나가는 문제가 돌아온다
 */
export function useKakaoLogin(code: string | null) {
	return useQuery({
		queryKey: ["auth", "kakao-login", code],
		queryFn: code === null ? skipToken : () => exchangeCodeForTokens(code),
		retry: false,
		staleTime: Infinity
	});
}
