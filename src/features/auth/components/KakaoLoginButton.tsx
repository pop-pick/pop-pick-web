"use client";

import KakaoTalkIcon from "@/shared/assets/icons/kakao-talk.svg";
import { Button } from "@/shared/ui/Button";
import { SvgIcon } from "@/shared/ui/SvgIcon";

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
			<SvgIcon icon={KakaoTalkIcon} size={16} />
			카카오 계정으로 로그인
		</Button>
	);
}
