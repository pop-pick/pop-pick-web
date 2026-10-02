"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";

import { refreshAccessToken, setRefreshHandler, subscribeAuthExpired } from "@/shared/api/auth-token";
import { ApiError } from "@/shared/api/errors";
import { buildLoginPath } from "@/shared/model/login-path";

import { refreshAuthTokens } from "../api/refresh-auth-tokens";
import { isTokenRejectedError } from "../model/session-rejection";
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
		if (!isTokenRejectedError(error)) {
			console.warn("[auth] 세션을 확인하지 못했습니다", error);
			useAuthStore.getState().markSessionUnavailable();
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

/**
 * 핸들러 등록이 첫 재발급보다 먼저여야 해서 한 이펙트 안에서 순서대로 한다.
 * 세션 복원 전에 토큰 없이 받은 응답은 찜 여부가 전부 false라서 세션이 생기면 모든 쿼리를 다시 받는다
 */
export function AuthProvider({ children }: AuthProviderProps) {
	const router = useRouter();
	const queryClient = useQueryClient();

	useEffect(() => {
		setRefreshHandler(restoreSession);
		void refreshAccessToken();

		return () => {
			setRefreshHandler(null);
		};
	}, []);

	useEffect(() => {
		return useAuthStore.subscribe((state, previousState) => {
			const hasSessionStarted = previousState.accessToken === null && state.accessToken !== null;

			if (hasSessionStarted) {
				void queryClient.invalidateQueries();
			}
		});
	}, [queryClient]);

	useEffect(() => {
		return subscribeAuthExpired(() => {
			if (useAuthStore.getState().status !== "anonymous") {
				return;
			}

			const nextPath = `${window.location.pathname}${window.location.search}`;
			router.replace(buildLoginPath(nextPath));
		});
	}, [router]);

	return <>{children}</>;
}
