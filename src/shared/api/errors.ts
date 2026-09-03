export interface ApiErrorInit {
	status: number;
	statusText: string;
	url: string;
	body: unknown;
	cause?: unknown;
}

export class ApiError extends Error {
	readonly status: number;
	readonly statusText: string;
	readonly url: string;
	readonly body: unknown;

	constructor({ status, statusText, url, body, cause }: ApiErrorInit) {
		const label = status === 0 ? "네트워크 오류" : `${status} ${statusText}`.trim();
		super(`API 요청 실패: ${label} ${url}`, { cause });
		this.name = "ApiError";
		this.status = status;
		this.statusText = statusText;
		this.url = url;
		this.body = body;
	}

	get isNetworkError(): boolean {
		return this.status === 0;
	}
}
