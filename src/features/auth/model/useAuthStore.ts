import { create } from "zustand";

import { setAccessTokenSource } from "@/shared/api/auth-token";

/**
 * restoring은 앱 시작 재발급이 끝나기 전이고 보호 화면은 이 동안 기다린다.
 * anonymous는 쿠키가 없거나 토큰이 거절된 상태다.
 * unavailable은 네트워크나 서버 오류로 세션을 확인하지 못해 로그인 여부를 모르는 상태다
 */
export type AuthStatus = "restoring" | "anonymous" | "unavailable" | "authenticated";

interface AuthState {
	accessToken: string | null;
	status: AuthStatus;
	setAccessToken: (accessToken: string) => void;
	clear: () => void;
	markUnavailable: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
	accessToken: null,
	status: "restoring",
	setAccessToken: (accessToken) => {
		set({ accessToken, status: "authenticated" });
	},
	clear: () => {
		set({ accessToken: null, status: "anonymous" });
	},
	markUnavailable: () => {
		set({ accessToken: null, status: "unavailable" });
	}
}));

setAccessTokenSource(() => useAuthStore.getState().accessToken);
