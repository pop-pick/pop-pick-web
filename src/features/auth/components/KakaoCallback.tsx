"use client";

import { redirect, useSearchParams } from "next/navigation";

import { useKakaoLogin } from "../hooks/useKakaoLogin";
import {
	getLoginFailureMessage,
	getProviderErrorMessage,
	LOGIN_PENDING_MESSAGE,
	MISSING_CODE_MESSAGE
} from "../model/login-messages";
import { LoginFailure } from "./LoginFailure";
import { LoginStatus } from "./LoginStatus";

export function KakaoCallback() {
	const searchParams = useSearchParams();
	const code = searchParams.get("code");
	const state = searchParams.get("state");
	const providerError = searchParams.get("error");
	const loginQuery = useKakaoLogin({ code, state });

	if (providerError !== null) {
		return (
			<LoginFailure isCanceled={providerError === "access_denied"}>
				{getProviderErrorMessage(providerError)}
			</LoginFailure>
		);
	}

	if (code === null) {
		return <LoginFailure>{MISSING_CODE_MESSAGE}</LoginFailure>;
	}

	if (loginQuery.isError) {
		return <LoginFailure>{getLoginFailureMessage(loginQuery.error)}</LoginFailure>;
	}

	if (loginQuery.isSuccess) {
		redirect(`/login/complete?next=${encodeURIComponent(loginQuery.data.nextPath)}`);
	}

	return <LoginStatus>{LOGIN_PENDING_MESSAGE}</LoginStatus>;
}
