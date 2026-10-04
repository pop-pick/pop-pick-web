import { create } from "zustand";

import { setAccessTokenSource } from "@/shared/api/auth-token";

export type AuthStatus = "restoring" | "anonymous" | "unavailable" | "authenticated";

interface AuthState {
	accessToken: string | null;
	status: AuthStatus;
	/** 세션이 끝날 때마다 올라간다. 시작할 때와 다르면 그사이 로그아웃이나 만료가 있었다는 뜻이다 */
	endedSessionCount: number;
	setAccessToken: (accessToken: string) => void;
	clearSession: () => void;
	markSessionUnavailable: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
	accessToken: null,
	status: "restoring",
	endedSessionCount: 0,
	setAccessToken: (accessToken) => {
		set({ accessToken, status: "authenticated" });
	},
	clearSession: () => {
		set((state) => ({ accessToken: null, status: "anonymous", endedSessionCount: state.endedSessionCount + 1 }));
	},
	markSessionUnavailable: () => {
		set({ accessToken: null, status: "unavailable" });
	}
}));

setAccessTokenSource(() => useAuthStore.getState().accessToken);
