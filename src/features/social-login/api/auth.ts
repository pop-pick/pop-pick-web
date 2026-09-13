import { api } from "@/shared/api/client";
import { ApiError } from "@/shared/api/errors";

export interface AuthTokens {
	accessToken: string;
	refreshToken: string;
}

interface ErrorMessage {
	errorCode: string;
	message: string;
	data: unknown;
}

interface ResultEnvelope<T> {
	resultType: "SUCCESS" | "ERROR";
	data?: T;
	error: ErrorMessage | null;
}

function assertSuccess(envelope: ResultEnvelope<unknown>, path: string): void {
	if (envelope.resultType === "ERROR") {
		throw new ApiError({
			status: 200,
			statusText: envelope.error?.errorCode ?? "UNKNOWN_ERROR",
			url: path,
			body: envelope.error
		});
	}
}

function unwrap<T>(envelope: ResultEnvelope<T>, path: string): T {
	assertSuccess(envelope, path);
	if (envelope.data === undefined) {
		throw new ApiError({ status: 200, statusText: "EMPTY_DATA", url: path, body: envelope.error });
	}
	return envelope.data;
}

export async function loginWithKakao(authToken: string, redirectUri: string): Promise<AuthTokens> {
	const path = "/api/v1/auth/login";
	const envelope = await api.post<ResultEnvelope<AuthTokens>>(path, {
		authToken,
		redirectUri,
		oauthProvider: "KAKAO"
	});

	return unwrap(envelope, path);
}

export async function refreshTokens(refreshToken: string): Promise<AuthTokens> {
	const path = "/api/v1/auth/refresh";
	const envelope = await api.post<ResultEnvelope<AuthTokens>>(path, { refreshToken });

	return unwrap(envelope, path);
}

export async function logout(accessToken: string, refreshToken: string): Promise<void> {
	const path = "/api/v1/auth/logout";
	const envelope = await api.post<ResultEnvelope<unknown>>(
		path,
		{ refreshToken },
		{ headers: { authorization: `Bearer ${accessToken}` } }
	);

	assertSuccess(envelope, path);
}
