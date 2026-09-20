import { api } from "@/shared/api/client";

/**
 * Route Handler가 쿠키를 지우고 백엔드 로그아웃을 부른다.
 * 토큰이 없어도 쿠키는 지워야 하므로 `auth`를 끄고 있을 때만 Bearer를 싣는다.
 */
export async function logout(accessToken: string | null) {
	await api.delete<null>("/api/auth/session", { auth: false, accessToken: accessToken ?? undefined });
}
