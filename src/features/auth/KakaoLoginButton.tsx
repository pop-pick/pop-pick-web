"use client";

import { Button } from "@/shared/ui/Button";

import { buildKakaoAuthorizeUrl, getKakaoRedirectUri } from "./lib/kakao-oauth";
import { storeNextPath } from "./lib/next-path";
import { createOAuthState } from "./lib/oauth-state";

interface KakaoLoginButtonProps {
	next: string | null;
}

export function KakaoLoginButton({ next }: KakaoLoginButtonProps) {
	return (
		<Button
			size="lg"
			onClick={() => {
				storeNextPath(next);
				window.location.href = buildKakaoAuthorizeUrl(getKakaoRedirectUri(), createOAuthState());
			}}
		>
			카카오로 계속하기
		</Button>
	);
}
