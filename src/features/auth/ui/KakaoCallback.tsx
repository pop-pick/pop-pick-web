"use client";

import { redirect, useSearchParams } from "next/navigation";

import { useKakaoLogin } from "../hooks/useKakaoLogin";
import {
	getKakaoDenialMessage,
	getLoginFailureMessage,
	LOGIN_PENDING_MESSAGE,
	MISSING_CODE_MESSAGE
} from "../model/login-messages";
import { LoginStatus } from "./LoginStatus";

export function KakaoCallback() {
	const searchParams = useSearchParams();
	const code = searchParams.get("code");
	const state = searchParams.get("state");
	const providerError = searchParams.get("error");
	const loginQuery = useKakaoLogin({ code, state });

	if (providerError !== null) {
		return <LoginStatus showHomeLink>{getKakaoDenialMessage(providerError)}</LoginStatus>;
	}

	if (code === null) {
		return <LoginStatus showHomeLink>{MISSING_CODE_MESSAGE}</LoginStatus>;
	}

	if (loginQuery.isError) {
		return <LoginStatus showHomeLink>{getLoginFailureMessage(loginQuery.error)}</LoginStatus>;
	}

	if (loginQuery.isSuccess) {
		redirect(loginQuery.data.nextPath);
	}

	return <LoginStatus>{LOGIN_PENDING_MESSAGE}</LoginStatus>;
}
