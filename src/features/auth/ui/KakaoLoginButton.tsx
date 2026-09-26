"use client";

import { Button } from "@/shared/ui/Button";

import { buildKakaoAuthorizeUrl, getKakaoRedirectUri } from "../model/kakao-oauth";
import { storeNextPath } from "../model/next-path";
import { createOAuthState } from "../model/oauth-state";

interface KakaoLoginButtonProps {
	next: string | null;
}

export function KakaoLoginButton({ next }: KakaoLoginButtonProps) {
	const handleLogin = () => {
		storeNextPath(next);
		window.location.href = buildKakaoAuthorizeUrl(getKakaoRedirectUri(), createOAuthState());
	};

	return (
		<Button variant="kakao" size="lg" onClick={handleLogin}>
			카카오로 계속하기
		</Button>
	);
}
