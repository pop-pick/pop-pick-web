"use client";

import Image from "next/image";

import { Button } from "@/shared/ui/Button";

import { storeNextPath } from "../model/next-path";
import { buildOAuthAuthorizeUrl, buildOAuthRedirectUri } from "../model/oauth-provider";
import { createOAuthState } from "../model/oauth-state";

const GOOGLE_LOGO_SIZE = 24;

interface GoogleLoginButtonProps {
	nextPath: string | null;
}

export function GoogleLoginButton({ nextPath }: GoogleLoginButtonProps) {
	const handleLogin = () => {
		storeNextPath(nextPath);
		window.location.href = buildOAuthAuthorizeUrl("GOOGLE", buildOAuthRedirectUri("GOOGLE"), createOAuthState());
	};

	return (
		<Button variant="google" size="xl" onClick={handleLogin}>
			<Image
				src="/images/brand/google-g.png"
				alt=""
				width={GOOGLE_LOGO_SIZE}
				height={GOOGLE_LOGO_SIZE}
				className="size-6 shrink-0"
			/>
			Google 계정으로 로그인
		</Button>
	);
}
