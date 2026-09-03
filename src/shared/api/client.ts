import { ApiError } from "./errors";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

type QueryValue = string | number | boolean | null | undefined;

export interface RequestOptions extends Omit<RequestInit, "body"> {
	query?: Record<string, QueryValue> | URLSearchParams;
	json?: unknown;
}

function resolveUrl(path: string, query: RequestOptions["query"]): string {
	if (!baseUrl) {
		throw new Error("NEXT_PUBLIC_API_BASE_URL이 비어 있다. .env.example을 참고해 채운다");
	}

	const url = new URL(`${baseUrl.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`);

	if (query instanceof URLSearchParams) {
		url.search = query.toString();
	} else if (query) {
		for (const [key, value] of Object.entries(query)) {
			if (value !== null && value !== undefined) {
				url.searchParams.set(key, String(value));
			}
		}
	}

	return url.toString();
}

function buildHeaders(headers: HeadersInit | undefined, hasJsonBody: boolean): Headers {
	const result = new Headers(headers);
	if (hasJsonBody && !result.has("content-type")) {
		result.set("content-type", "application/json");
	}
	return result;
}

async function readBody(response: Response): Promise<unknown> {
	if (response.status === 204) {
		return null;
	}

	const text = await response.text();
	if (text === "") {
		return null;
	}

	if (!(response.headers.get("content-type") ?? "").includes("json")) {
		return text;
	}

	try {
		return JSON.parse(text) as unknown;
	} catch (cause) {
		throw new ApiError({
			status: response.status,
			statusText: "응답 본문을 JSON으로 읽지 못함",
			url: response.url,
			body: text,
			cause
		});
	}
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
	const { query, json, headers, ...init } = options;
	const url = resolveUrl(path, query);

	let response: Response;
	try {
		response = await fetch(url, {
			...init,
			headers: buildHeaders(headers, json !== undefined),
			body: json !== undefined ? JSON.stringify(json) : undefined
		});
	} catch (cause) {
		throw new ApiError({ status: 0, statusText: "", url, body: null, cause });
	}

	const body = await readBody(response);

	if (!response.ok) {
		throw new ApiError({
			status: response.status,
			statusText: response.statusText,
			url,
			body
		});
	}

	return body as T;
}

export const api = {
	get: <T>(path: string, options?: RequestOptions): Promise<T> => request<T>(path, { ...options, method: "GET" }),
	post: <T>(path: string, json?: unknown, options?: RequestOptions): Promise<T> =>
		request<T>(path, { ...options, method: "POST", json }),
	put: <T>(path: string, json?: unknown, options?: RequestOptions): Promise<T> =>
		request<T>(path, { ...options, method: "PUT", json }),
	patch: <T>(path: string, json?: unknown, options?: RequestOptions): Promise<T> =>
		request<T>(path, { ...options, method: "PATCH", json }),
	delete: <T>(path: string, options?: RequestOptions): Promise<T> => request<T>(path, { ...options, method: "DELETE" })
};
