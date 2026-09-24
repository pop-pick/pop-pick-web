import { ApiError } from "@/shared/api/errors";

/** 리프레시 토큰 자체가 못 쓰게 된 실패. 서버 장애와 갈라야 멀쩡한 쿠키를 지우지 않고 로그인한 사용자를 로그인 화면으로 보내지 않는다 */
const REJECTED_CODES = new Set(["E1011", "E1000"]);

export function isRejectedToken(error: unknown) {
	if (!(error instanceof ApiError)) {
		return false;
	}

	return error.status === 401 || (error.errorCode !== null && REJECTED_CODES.has(error.errorCode));
}
