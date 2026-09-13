"use client";

import { useMutation } from "@tanstack/react-query";

import { logout } from "../api/auth";
import { useAuthStore } from "../store/useAuthStore";

export function useLogout() {
	return useMutation({
		mutationFn: async () => {
			const { accessToken, refreshToken } = useAuthStore.getState();
			if (accessToken === null || refreshToken === null) {
				return;
			}

			await logout(accessToken, refreshToken);
		},
		onError: (error) => {
			console.warn("[auth] 로그아웃 요청이 실패했습니다", error);
		},
		onSettled: () => {
			useAuthStore.getState().clear();
		}
	});
}
