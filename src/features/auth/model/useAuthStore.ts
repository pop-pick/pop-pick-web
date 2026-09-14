import { create } from "zustand";

import { setAccessTokenSource } from "@/shared/api/auth-token";

import type { AuthTokens } from "./auth";

interface AuthState {
	accessToken: string | null;
	refreshToken: string | null;
	setTokens: (tokens: AuthTokens) => void;
	clear: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
	accessToken: null,
	refreshToken: null,
	setTokens: ({ accessToken, refreshToken }) => {
		set({ accessToken, refreshToken });
	},
	clear: () => {
		set({ accessToken: null, refreshToken: null });
	}
}));

setAccessTokenSource(() => useAuthStore.getState().accessToken);
