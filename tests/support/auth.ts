import { useAuthStore } from "@/features/auth/model/useAuthStore";

export function signInAsMember(accessToken = "test-access-token") {
	useAuthStore.getState().setAccessToken(accessToken);
}

export function signOutAsGuest() {
	useAuthStore.getState().clearSession();
}
