"use client";

import { useMutation } from "@tanstack/react-query";

import { logout } from "../api/auth";
import { useAuthStore } from "../store/useAuthStore";

/**
 * 서버 응답과 무관하게 스토어를 비운다.
 * 블랙리스트 등록이 실패해도 사용자의 로그아웃 의도를 되돌리지 않는다. 실패는 로그로 남는다
 */
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
