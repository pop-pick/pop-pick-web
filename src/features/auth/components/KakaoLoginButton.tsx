"use client";

import KakaoTalkIcon from "@/shared/assets/icons/kakao-talk.svg";
import { Button } from "@/shared/ui/Button";
import { SvgIcon } from "@/shared/ui/SvgIcon";

import { startOAuthLogin } from "../model/oauth-provider";

interface KakaoLoginButtonProps {
	nextPath: string | null;
}

export function KakaoLoginButton({ nextPath }: KakaoLoginButtonProps) {
	const handleLogin = () => {
		startOAuthLogin("KAKAO", nextPath);
	};

	return (
		<Button variant="kakao" size="xl" onClick={handleLogin}>
			<SvgIcon icon={KakaoTalkIcon} size={16} />
			카카오 계정으로 로그인
		</Button>
	);
}
