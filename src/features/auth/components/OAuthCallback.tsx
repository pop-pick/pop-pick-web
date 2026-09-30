"use client";

import { redirect, useSearchParams } from "next/navigation";

import { useOAuthLogin } from "../hooks/useOAuthLogin";
import type { OAuthProvider } from "../model/auth";
import {
	LOGIN_PENDING_MESSAGE,
	MISSING_CODE_MESSAGE,
	toLoginFailureMessage,
	toProviderErrorMessage
} from "../model/login-messages";
import { LoginFailure } from "./LoginFailure";
import { LoginStatus } from "./LoginStatus";

interface OAuthCallbackProps {
	provider: OAuthProvider;
}

export function OAuthCallback({ provider }: OAuthCallbackProps) {
	const searchParams = useSearchParams();
	const code = searchParams.get("code");
	const state = searchParams.get("state");
	const providerError = searchParams.get("error");
	const loginQuery = useOAuthLogin(provider, { code, state });

	if (providerError !== null) {
		return (
			<LoginFailure isCanceled={providerError === "access_denied"}>
				{toProviderErrorMessage(provider, providerError)}
			</LoginFailure>
		);
	}

	if (code === null) {
		return <LoginFailure>{MISSING_CODE_MESSAGE}</LoginFailure>;
	}

	if (loginQuery.isError) {
		return <LoginFailure>{toLoginFailureMessage(provider, loginQuery.error)}</LoginFailure>;
	}

	if (loginQuery.isSuccess) {
		redirect(loginQuery.data.nextPath);
	}

	return <LoginStatus>{LOGIN_PENDING_MESSAGE}</LoginStatus>;
}
