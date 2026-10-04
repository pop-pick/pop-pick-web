"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";

import {
	notifySessionEnded,
	refreshAccessToken,
	setRefreshHandler,
	subscribeAuthExpired
} from "@/shared/api/auth-token";
import { ApiError } from "@/shared/api/errors";
import { clearAccountStorage } from "@/shared/model/account-storage";
import { buildLoginPath } from "@/shared/model/login-path";

import { refreshSession } from "../api/refresh-session";
import { isTokenRejectedError } from "../model/session-rejection";
import { useAuthStore } from "../model/useAuthStore";

const NO_SESSION_ERROR_CODE = "E1000";

function isNoSession(error: unknown) {
	return error instanceof ApiError && error.errorCode === NO_SESSION_ERROR_CODE;
}

function hasLoggedInSince(hadToken: boolean) {
	return !hadToken && useAuthStore.getState().accessToken !== null;
}

async function restoreSession() {
	const { accessToken: tokenAtStart, endedSessionCount: endedAtStart } = useAuthStore.getState();
	const hadToken = tokenAtStart !== null;

	try {
		const { accessToken } = await refreshSession();

		if (useAuthStore.getState().endedSessionCount !== endedAtStart) {
			return false;
		}

		useAuthStore.getState().setAccessToken(accessToken);

		return true;
	} catch (error) {
		if (hasLoggedInSince(hadToken)) {
			return true;
		}

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
		let hasHadSession = useAuthStore.getState().status === "authenticated";

		return useAuthStore.subscribe((state) => {
			if (state.status === "authenticated") {
				hasHadSession = true;
			}

			if (state.status === "anonymous" && hasHadSession) {
				hasHadSession = false;
				queryClient.removeQueries();
				notifySessionEnded();
				clearAccountStorage();
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
