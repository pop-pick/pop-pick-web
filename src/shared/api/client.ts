import { getAccessToken, notifyAuthExpired, refreshAccessToken } from "./auth-token";
import { ApiError } from "./errors";
import { isApiResponse } from "./types";

const DEFAULT_TIMEOUT_MS = 10_000;

const EXPIRED_ERROR_CODE = "E1004";

const NO_TOKEN_ERROR_CODE = "E1000";

type QueryValue = string | number | boolean | null | undefined;

export interface RequestOptions extends Omit<RequestInit, "body"> {
	query?: Record<string, QueryValue> | URLSearchParams;
	json?: unknown;
	timeoutMs?: number;
	auth?: boolean;
	accessToken?: string;
}

function resolveBaseUrl() {
	if (typeof window !== "undefined") {
		return window.location.origin;
	}

	const apiBaseUrl = process.env.API_BASE_URL;
	if (!apiBaseUrl) {
		throw new Error("API_BASE_URL이 비어 있다. 로컬은 .env.local에, 배포는 Vercel 환경 변수에 백엔드 주소를 채운다");
	}

	return apiBaseUrl;
}

function setQuery(url: URL, query: RequestOptions["query"]) {
	if (query === undefined) {
		return;
	}

	const entries = query instanceof URLSearchParams ? query.entries() : Object.entries(query);
	for (const [key, value] of entries) {
		if (value !== null && value !== undefined) {
			url.searchParams.set(key, String(value));
		}
	}
}

function resolveUrl(path: string, query: RequestOptions["query"]) {
	const isBackendPath = path.startsWith("/") && !path.startsWith("//");
	if (!isBackendPath) {
		throw new Error(`path는 /로 시작하는 백엔드 경로여야 한다: ${path}`);
	}

	const url = new URL(path, resolveBaseUrl());
	setQuery(url, query);

	return url;
}

function resolveToken(auth: boolean, accessToken: string | undefined) {
	if (accessToken !== undefined) {
		return accessToken;
	}

	return auth ? getAccessToken() : null;
}

function buildHeaders(headers: HeadersInit | undefined, hasJsonBody: boolean, token: string | null) {
	const result = new Headers(headers);
	if (!result.has("accept")) {
		result.set("accept", "application/json");
	}

	if (hasJsonBody && !result.has("content-type")) {
		result.set("content-type", "application/json");
	}

	if (token !== null) {
		result.set("authorization", `Bearer ${token}`);
	}

	return result;
}

function buildSignal(signal: RequestInit["signal"], timeoutMs: number) {
	const timeout = AbortSignal.timeout(timeoutMs);
	return signal ? AbortSignal.any([signal, timeout]) : timeout;
}

function isAbortedByCaller(cause: unknown) {
	return cause instanceof Error && cause.name === "AbortError";
}

function isTimedOut(cause: unknown) {
	return cause instanceof Error && cause.name === "TimeoutError";
}

async function fetchResponse(url: URL, init: RequestInit) {
	try {
		const response = await fetch(url, init);

		return {
			response,
			text: await response.text()
		};
	} catch (cause) {
		if (isAbortedByCaller(cause)) {
			throw cause;
		}

		throw new ApiError({
			kind: isTimedOut(cause) ? "timeout" : "network",
			status: 0,
			url: url.href,
			body: null,
			errorCode: null,
			cause
		});
	}
}

function parseBody(text: string, contentType: string | null) {
	if (text === "") {
		return null;
	}

	const isJson = contentType !== null && contentType.includes("json");
	if (!isJson) {
		return text;
	}

	try {
		return JSON.parse(text) as unknown;
	} catch {
		return text;
	}
}

function readErrorCode(body: unknown) {
	return isApiResponse(body) && body.error !== null ? body.error.errorCode : null;
}

async function sendOnce<T>(path: string, options: RequestOptions) {
	const { query, json, headers, signal, timeoutMs = DEFAULT_TIMEOUT_MS, auth = true, accessToken, ...init } = options;
	const url = resolveUrl(path, query);
	const token = resolveToken(auth, accessToken);

	if (auth && token === null) {
		throw new ApiError({ kind: "http", status: 401, url: url.href, body: null, errorCode: NO_TOKEN_ERROR_CODE });
	}

	const { response, text } = await fetchResponse(url, {
		...init,
		headers: buildHeaders(headers, json !== undefined, token),
		body: json !== undefined ? JSON.stringify(json) : undefined,
		signal: buildSignal(signal, timeoutMs)
	});
	const body = parseBody(text, response.headers.get("content-type"));

	if (!response.ok) {
		throw new ApiError({ kind: "http", status: response.status, url: url.href, body, errorCode: readErrorCode(body) });
	}

	if (body === null) {
		return null as T;
	}

	if (!isApiResponse(body)) {
		throw new ApiError({ kind: "invalid-body", status: response.status, url: url.href, body, errorCode: null });
	}

	if (body.resultType === "ERROR") {
		throw new ApiError({ kind: "http", status: response.status, url: url.href, body, errorCode: readErrorCode(body) });
	}

	return body.data as T;
}

function canRefresh(error: unknown, auth: boolean) {
	if (typeof window === "undefined" || !auth) {
		return false;
	}

	return error instanceof ApiError && error.errorCode === EXPIRED_ERROR_CODE;
}

export async function request<T>(path: string, options: RequestOptions = {}) {
	try {
		return await sendOnce<T>(path, options);
	} catch (error) {
		if (!canRefresh(error, options.auth ?? true)) {
			throw error;
		}

		const refreshed = await refreshAccessToken();
		if (!refreshed) {
			notifyAuthExpired();
			throw error;
		}

		return sendOnce<T>(path, options);
	}
}

export const api = {
	get: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: "GET" }),
	post: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: "POST" }),
	put: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: "PUT" }),
	patch: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: "PATCH" }),
	delete: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: "DELETE" })
};
