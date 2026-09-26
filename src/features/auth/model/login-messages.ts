import { ApiError } from "@/shared/api/errors";

import { OAuthStateMismatchError } from "./oauth-state";

export const LOGIN_PENDING_MESSAGE = "로그인 처리 중입니다";
export const MISSING_CODE_MESSAGE = "잘못된 접근입니다. 로그인을 처음부터 다시 시작해 주세요.";

const KAKAO_AUTH_FAILURE_CODES = new Set(["E1001", "E1009"]);

export function getProviderErrorMessage(providerError: string) {
	return providerError === "access_denied"
		? "로그인을 취소했습니다."
		: "카카오 로그인에 실패했습니다. 다시 시도해 주세요.";
}

export function getLoginFailureMessage(error: unknown) {
	if (error instanceof OAuthStateMismatchError) {
		return "로그인 요청을 확인할 수 없습니다. 처음부터 다시 로그인해 주세요.";
	}

	if (error instanceof ApiError) {
		if (error.errorCode !== null && KAKAO_AUTH_FAILURE_CODES.has(error.errorCode)) {
			return "카카오 인증에 실패했습니다. 다시 로그인해 주세요.";
		}

		if (error.kind === "network") {
			return "네트워크에 연결할 수 없습니다. 연결을 확인하고 다시 시도해 주세요.";
		}

		if (error.kind === "timeout") {
			return "서버 응답이 늦어 로그인하지 못했습니다. 잠시 뒤 다시 시도해 주세요.";
		}
	}

	return "로그인에 실패했습니다. 잠시 뒤 다시 시도해 주세요.";
}
