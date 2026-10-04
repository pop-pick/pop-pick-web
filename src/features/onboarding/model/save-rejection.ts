import { ApiError } from "@/shared/api/errors";

/** 400은 같은 요청을 다시 보내도 같은 답이 온다. 이미 저장한 회원과 필수 값이 빠진 요청이 둘 다 이 코드(E400)라 코드로는 가를 수 없다 */
export function isSaveRejected(error: unknown) {
	return error instanceof ApiError && error.kind === "http" && error.status === 400;
}
