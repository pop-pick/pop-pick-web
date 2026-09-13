export type ApiErrorKind = "http" | "network" | "timeout" | "invalid-body";

interface ApiErrorInit {
	kind: ApiErrorKind;
	status: number;
	url: string;
	body: unknown;
	errorCode: string | null;
	cause?: unknown;
}

function describe({ kind, status, errorCode, url }: ApiErrorInit) {
	const code = errorCode === null ? "" : ` errorCode=${errorCode}`;
	return `API 요청 실패: kind=${kind} status=${status}${code} url=${url}`;
}

export class ApiError extends Error {
	/**
	 * http는 2xx가 아닌 응답과 2xx인데 resultType이 ERROR인 응답.
	 * network는 fetch 자체가 거절된 경우, timeout은 기본 타임아웃에 걸린 경우.
	 * invalid-body는 2xx인데 본문이 JSON이 아니거나 응답 공통 구조가 아닌 경우
	 */
	readonly kind: ApiErrorKind;
	/** 응답을 받지 못했으면 0 */
	readonly status: number;
	readonly url: string;
	readonly body: unknown;
	/** 본문이 응답 공통 구조이고 error가 있으면 그 errorCode, 아니면 null */
	readonly errorCode: string | null;

	constructor(init: ApiErrorInit) {
		super(describe(init), { cause: init.cause });
		this.name = "ApiError";
		this.kind = init.kind;
		this.status = init.status;
		this.url = init.url;
		this.body = init.body;
		this.errorCode = init.errorCode;
	}
}
