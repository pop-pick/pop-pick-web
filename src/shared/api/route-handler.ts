import { NextResponse } from "next/server";

import { ApiError } from "./errors";
import { type ApiResponse, isApiResponse } from "./types";

export function toSuccessResponse<T>(data: T) {
	const body: ApiResponse<T> = { resultType: "SUCCESS", data, error: null };

	return NextResponse.json(body);
}

export function toErrorResponse(params: { status: number; errorCode: string; message: string }) {
	const body: ApiResponse<null> = {
		resultType: "ERROR",
		data: null,
		error: { errorCode: params.errorCode, message: params.message, data: null }
	};

	return NextResponse.json(body, { status: params.status });
}

/**
 * 백엔드가 낸 실패를 상태 코드와 함께 그대로 넘긴다. 브라우저가 `errorCode`로 문구를 가르므로
 * 여기서 뭉개면 그 정보가 사라진다. 백엔드 실패가 아닌 것은 다시 던져 500으로 드러낸다.
 */
export function toBackendErrorResponse(error: unknown) {
	if (error instanceof ApiError && error.kind === "http" && isApiResponse(error.body)) {
		return NextResponse.json(error.body, { status: error.status });
	}

	throw error;
}

const BEARER_PREFIX = "Bearer ";

/** Route Handler가 브라우저에서 받은 액세스 토큰을 꺼낸다. 백엔드로 넘길 때 `accessToken` 옵션에 싣는다 */
export function readBearerToken(request: Request) {
	const header = request.headers.get("authorization");

	if (header === null || !header.startsWith(BEARER_PREFIX)) {
		return null;
	}

	return header.slice(BEARER_PREFIX.length);
}
