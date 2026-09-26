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

export function toBackendErrorResponse(error: unknown) {
	if (error instanceof ApiError && error.kind === "http" && isApiResponse(error.body)) {
		return NextResponse.json(error.body, { status: error.status });
	}

	throw error;
}

const BEARER_PREFIX = "Bearer ";

export function readBearerToken(request: Request) {
	const header = request.headers.get("authorization");

	if (header === null || !header.startsWith(BEARER_PREFIX)) {
		return null;
	}

	return header.slice(BEARER_PREFIX.length);
}
