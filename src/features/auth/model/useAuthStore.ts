import { create } from "zustand";

import { setAccessTokenSource } from "@/shared/api/auth-token";

/** restoring은 앱 시작 재발급이 끝나기 전이다. 보호 화면은 이 동안 기다린다 */
export type AuthStatus = "restoring" | "anonymous" | "authenticated";

interface AuthState {
	accessToken: string | null;
	status: AuthStatus;
	setAccessToken: (accessToken: string) => void;
	clear: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
	accessToken: null,
	status: "restoring",
	setAccessToken: (accessToken) => {
		set({ accessToken, status: "authenticated" });
	},
	clear: () => {
		set({ accessToken: null, status: "anonymous" });
	}
}));

setAccessTokenSource(() => useAuthStore.getState().accessToken);
