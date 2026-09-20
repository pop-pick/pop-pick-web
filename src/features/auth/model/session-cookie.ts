import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

export const REFRESH_COOKIE_NAME = "pp_refresh";

/**
 * 백엔드 `JwtGenerator`의 리프레시 토큰 수명과 같은 값이다.
 * 쿠키가 먼저 죽으면 사용자는 살아 있는 세션을 두고 다시 로그인한다.
 */
const REFRESH_MAX_AGE_SECONDS = 60 * 60 * 24 * 14;

const COOKIE_OPTIONS = {
	httpOnly: true,
	secure: true,
	sameSite: "lax",
	path: "/"
} as const;

export function setRefreshCookie(response: NextResponse, refreshToken: string) {
	response.cookies.set(REFRESH_COOKIE_NAME, refreshToken, { ...COOKIE_OPTIONS, maxAge: REFRESH_MAX_AGE_SECONDS });

	return response;
}

export function clearRefreshCookie(response: NextResponse) {
	response.cookies.set(REFRESH_COOKIE_NAME, "", { ...COOKIE_OPTIONS, maxAge: 0 });

	return response;
}

export async function readRefreshToken() {
	const store = await cookies();

	return store.get(REFRESH_COOKIE_NAME)?.value ?? null;
}
