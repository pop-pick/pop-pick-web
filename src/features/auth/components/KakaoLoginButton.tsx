"use client";

import { Button } from "@/shared/ui/Button";

import { buildKakaoAuthorizeUrl, buildKakaoRedirectUri } from "../model/kakao-oauth";
import { storeNextPath } from "../model/next-path";
import { createOAuthState } from "../model/oauth-state";

interface KakaoLoginButtonProps {
	nextPath: string | null;
}

export function KakaoLoginButton({ nextPath }: KakaoLoginButtonProps) {
	const handleLogin = () => {
		storeNextPath(nextPath);
		window.location.href = buildKakaoAuthorizeUrl(buildKakaoRedirectUri(), createOAuthState());
	};

	return (
		<Button variant="kakao" size="lg" onClick={handleLogin}>
			카카오로 계속하기
		</Button>
	);
}
