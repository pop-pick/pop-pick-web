import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { logout } from "../api/logout";
import { useAuthStore } from "../model/useAuthStore";

const HOME_PATH = "/";

/** 요청이 실패해도 이 브라우저의 세션은 끝내고 홈으로 보낸다. 최근 본 팝업과 온보딩 답, 회원 쿼리는 세션이 끝날 때 AuthProvider가 비운다. 이동을 여기서 해야 RequireAuth가 같은 전이에 로그인 화면으로 보내지 않는다 */
export function useLogout() {
	const router = useRouter();

	return useMutation({
		mutationFn: () => logout(useAuthStore.getState().accessToken),
		onError: (error) => {
			console.warn("[auth] 로그아웃 요청이 실패했습니다", error);
		},
		onSettled: () => {
			useAuthStore.getState().clearSession();
			router.replace(HOME_PATH);
		}
	});
}
