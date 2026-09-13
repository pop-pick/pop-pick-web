export type ApiErrorKind = "http" | "network" | "timeout" | "invalid-body";

interface ApiErrorInit {
	kind: ApiErrorKind;
	status: number;
	url: string;
	body: unknown;
	errorCode: string | null;
	cause?: unknown;
}

function buildMessage({ kind, status, errorCode, url }: ApiErrorInit) {
	const code = errorCode === null ? "" : ` errorCode=${errorCode}`;
	return `API 요청 실패: kind=${kind} status=${status}${code} url=${url}`;
}

export class ApiError extends Error {
	readonly kind: ApiErrorKind;
	readonly status: number;
	readonly url: string;
	readonly body: unknown;
	readonly errorCode: string | null;

	constructor(init: ApiErrorInit) {
		super(buildMessage(init), { cause: init.cause });
		this.name = "ApiError";
		this.kind = init.kind;
		this.status = init.status;
		this.url = init.url;
		this.body = init.body;
		this.errorCode = init.errorCode;
	}
}
