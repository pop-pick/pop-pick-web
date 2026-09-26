"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";

import { refreshAccessToken, setRefreshHandler, subscribeAuthExpired } from "@/shared/api/auth-token";
import { ApiError } from "@/shared/api/errors";

import { refreshAuthTokens } from "../api/refresh-auth-tokens";
import { buildLoginPath } from "../model/next-path";
import { isRejectedToken } from "../model/session-rejection";
import { useAuthStore } from "../model/useAuthStore";

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
		if (!isRejectedToken(error)) {
			console.warn("[auth] 세션을 확인하지 못했습니다", error);
			useAuthStore.getState().markUnavailable();
			return false;
		}

		if (!isNoSession(error)) {
			console.warn("[auth] 세션을 되살리지 못했습니다", error);
		}

		useAuthStore.getState().clearSession();

		return false;
	}
}

interface AuthProviderProps {
	children: ReactNode;
}

/** 핸들러 등록이 첫 재발급보다 먼저여야 해서 한 이펙트 안에서 순서대로 한다 */
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
			if (useAuthStore.getState().status !== "anonymous") {
				return;
			}

			const next = `${window.location.pathname}${window.location.search}`;
			router.replace(buildLoginPath(next));
		});
	}, [router]);

	return <>{children}</>;
}
