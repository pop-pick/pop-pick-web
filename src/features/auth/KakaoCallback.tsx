"use client";

import { redirect, useSearchParams } from "next/navigation";

import { useKakaoLogin } from "./hooks/useKakaoLogin";
import {
	describeKakaoDenial,
	describeLoginFailure,
	LOGIN_PENDING_MESSAGE,
	MISSING_CODE_MESSAGE
} from "./lib/login-messages";
import { LoginStatus } from "./LoginStatus";

export function KakaoCallback() {
	const searchParams = useSearchParams();
	const code = searchParams.get("code");
	const state = searchParams.get("state");
	const denial = searchParams.get("error");
	const login = useKakaoLogin({ code, state });

	if (denial !== null) {
		return <LoginStatus showHomeLink>{describeKakaoDenial(denial)}</LoginStatus>;
	}

	if (code === null) {
		return <LoginStatus showHomeLink>{MISSING_CODE_MESSAGE}</LoginStatus>;
	}

	if (login.isError) {
		return <LoginStatus showHomeLink>{describeLoginFailure(login.error)}</LoginStatus>;
	}

	if (login.isSuccess) {
		redirect(login.data.nextPath);
	}

	return <LoginStatus>{LOGIN_PENDING_MESSAGE}</LoginStatus>;
}
