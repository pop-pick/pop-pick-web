"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { useRecentPopupsStore } from "@/shared/model/useRecentPopupsStore";

import { logout } from "../api/logout";
import { useAuthStore } from "../model/useAuthStore";

const HOME_PATH = "/";

/** 요청이 실패해도 이 브라우저의 세션과 기록은 비우고 홈으로 보낸다. 이동을 여기서 해야 RequireAuth가 같은 전이에 로그인 화면으로 보내지 않는다 */
export function useLogout() {
	const queryClient = useQueryClient();
	const router = useRouter();

	return useMutation({
		mutationFn: () => logout(useAuthStore.getState().accessToken),
		onError: (error) => {
			console.warn("[auth] 로그아웃 요청이 실패했습니다", error);
		},
		onSettled: () => {
			useRecentPopupsStore.getState().clearRecentPopups();
			useAuthStore.getState().clearSession();
			queryClient.removeQueries();
			router.replace(HOME_PATH);
		}
	});
}
