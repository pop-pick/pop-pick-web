import { create } from "zustand";

import { setAccessTokenSource } from "@/shared/api/auth-token";

export type AuthStatus = "restoring" | "anonymous" | "unavailable" | "authenticated";

interface AuthState {
	accessToken: string | null;
	status: AuthStatus;
	setAccessToken: (accessToken: string) => void;
	clearSession: () => void;
	markUnavailable: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
	accessToken: null,
	status: "restoring",
	setAccessToken: (accessToken) => {
		set({ accessToken, status: "authenticated" });
	},
	clearSession: () => {
		set({ accessToken: null, status: "anonymous" });
	},
	markUnavailable: () => {
		set({ accessToken: null, status: "unavailable" });
	}
}));

setAccessTokenSource(() => useAuthStore.getState().accessToken);
