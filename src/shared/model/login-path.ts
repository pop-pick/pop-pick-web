export const DEFAULT_NEXT_PATH = "/";

const SAME_ORIGIN_PROBE = "http://same-origin.invalid";

/** 브라우저는 `/\host`와 `/<탭>/host`를 `//host`로 읽는다. 문자열 접두사만 보면 외부 주소가 통과해서 URL 파서로 출처가 같은지 본다 */
export function sanitizeNextPath(value: string | null) {
	if (value === null || !value.startsWith("/") || value.startsWith("//")) {
		return null;
	}

	if (!URL.canParse(value, SAME_ORIGIN_PROBE) || new URL(value, SAME_ORIGIN_PROBE).origin !== SAME_ORIGIN_PROBE) {
		return null;
	}

	return value;
}

export function buildLoginPath(nextPath: string) {
	const safePath = sanitizeNextPath(nextPath) ?? DEFAULT_NEXT_PATH;
	return `/login?next=${encodeURIComponent(safePath)}`;
}
