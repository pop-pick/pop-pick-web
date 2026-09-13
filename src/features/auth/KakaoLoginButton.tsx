"use client";

import { Button } from "@/shared/ui/Button";

import { buildKakaoAuthorizeUrl, getKakaoRedirectUri } from "./lib/kakao-oauth";
import { issueOAuthState } from "./lib/oauth-state";

export function KakaoLoginButton() {
	return (
		<Button
			onClick={() => {
				window.location.href = buildKakaoAuthorizeUrl(getKakaoRedirectUri(), issueOAuthState());
			}}
		>
			카카오로 로그인
		</Button>
	);
}
