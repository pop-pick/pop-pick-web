"use client";

import { Button } from "@/shared/ui/Button";

import { buildKakaoAuthorizeUrl, getKakaoRedirectUri } from "./lib/kakao-oauth";

export function KakaoLoginButton() {
	return (
		<Button
			onClick={() => {
				window.location.href = buildKakaoAuthorizeUrl(getKakaoRedirectUri());
			}}
		>
			카카오로 로그인
		</Button>
	);
}
