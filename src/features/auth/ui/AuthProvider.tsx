"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";

import { refreshAccessToken, setRefreshHandler, subscribeAuthExpired } from "@/shared/api/auth-token";
import { ApiError } from "@/shared/api/errors";

import { refreshAuthTokens } from "../api/refresh-auth-tokens";
import { useAuthStore } from "../model/useAuthStore";

/** 쿠키가 없는 상태는 비로그인 방문자의 정상 흐름이라 로그를 남기지 않는다 */
const NO_SESSION_ERROR_CODE = "E1000";

function isNoSession(error: unknown) {
	return error instanceof ApiError && error.errorCode === NO_SESSION_ERROR_CODE;
}

async function restoreSession() {
	try {
		const { accessToken } = await refreshAuthTokens();
		useAuthStore.getState().setAccessToken(accessToken);

		return true;
	} catch (error) {
		if (!isNoSession(error)) {
			console.warn("[auth] 세션을 되살리지 못했습니다", error);
		}

		useAuthStore.getState().clear();

		return false;
	}
}

interface AuthProviderProps {
	children: ReactNode;
}

/**
 * 앱이 시작할 때 쿠키로 세션을 되살리고 만료 이벤트를 받아 로그인 화면으로 보낸다.
 * 핸들러 등록이 첫 재발급보다 먼저여야 하므로 한 이펙트 안에서 순서대로 한다.
 */
export function AuthProvider({ children }: AuthProviderProps) {
	const router = useRouter();

	useEffect(() => {
		setRefreshHandler(restoreSession);
		void refreshAccessToken();

		return () => {
			setRefreshHandler(null);
		};
	}, []);

	useEffect(() => {
		return subscribeAuthExpired(() => {
			const next = `${window.location.pathname}${window.location.search}`;
			router.push(`/login?next=${encodeURIComponent(next)}`);
		});
	}, [router]);

	return <>{children}</>;
}
