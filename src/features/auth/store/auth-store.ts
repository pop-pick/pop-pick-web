import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { AuthTokens } from "../api/auth";

interface AuthState {
	accessToken: string | null;
	refreshToken: string | null;
	setTokens: (tokens: AuthTokens) => void;
	clear: () => void;
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set) => ({
			accessToken: null,
			refreshToken: null,
			setTokens: ({ accessToken, refreshToken }) => {
				set({ accessToken, refreshToken });
			},
			clear: () => {
				set({ accessToken: null, refreshToken: null });
			}
		}),
		{
			name: "pop-pick-auth",
			partialize: (state) => ({ refreshToken: state.refreshToken })
		}
	)
);
