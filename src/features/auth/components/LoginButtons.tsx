"use client";

import { useSearchParams } from "next/navigation";

import { sanitizeNextPath } from "@/shared/model/login-path";

import { GoogleLoginButton } from "./GoogleLoginButton";
import { KakaoLoginButton } from "./KakaoLoginButton";

export function LoginButtons() {
	const nextPath = sanitizeNextPath(useSearchParams().get("next"));

	return (
		<>
			<KakaoLoginButton nextPath={nextPath} />
			<GoogleLoginButton nextPath={nextPath} />
		</>
	);
}
