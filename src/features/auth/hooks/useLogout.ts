"use client";

import { useMutation } from "@tanstack/react-query";

import { logout } from "../api/logout";
import { useAuthStore } from "../model/useAuthStore";

export function useLogout() {
	return useMutation({
		mutationFn: () => logout(useAuthStore.getState().accessToken),
		onError: (error) => {
			console.warn("[auth] 로그아웃 요청이 실패했습니다", error);
		},
		onSettled: () => {
			useAuthStore.getState().clear();
		}
	});
}
