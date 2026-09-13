const STORAGE_KEY = "pop-pick.next-path";

export const DEFAULT_NEXT_PATH = "/home";

/** 같은 출처 경로만 받는다. 절대 주소와 `//`로 시작하는 값은 다른 사이트로 보낼 수 있어 버린다 */
export function toSafeNextPath(value: string | null) {
	if (value === null || !value.startsWith("/") || value.startsWith("//")) {
		return null;
	}

	return value;
}

export function storeNextPath(next: string | null) {
	const safe = toSafeNextPath(next);
	if (safe === null) {
		window.sessionStorage.removeItem(STORAGE_KEY);
		return;
	}

	window.sessionStorage.setItem(STORAGE_KEY, safe);
}

/** 인가 흐름이 끝난 뒤 한 번 읽고 지운다. 저장한 값이 없으면 홈으로 보낸다 */
export function consumeNextPath() {
	const stored = window.sessionStorage.getItem(STORAGE_KEY);
	window.sessionStorage.removeItem(STORAGE_KEY);

	return toSafeNextPath(stored) ?? DEFAULT_NEXT_PATH;
}
