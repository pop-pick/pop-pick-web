const STORAGE_KEY = "pop-pick.next-path";

export const DEFAULT_NEXT_PATH = "/";

export function sanitizeNextPath(value: string | null) {
	if (value === null || !value.startsWith("/") || value.startsWith("//")) {
		return null;
	}

	return value;
}

export function buildLoginPath(nextPath: string) {
	const safePath = sanitizeNextPath(nextPath) ?? DEFAULT_NEXT_PATH;
	return `/login?next=${encodeURIComponent(safePath)}`;
}

export function storeNextPath(nextPath: string | null) {
	const safePath = sanitizeNextPath(nextPath);
	if (safePath === null) {
		window.sessionStorage.removeItem(STORAGE_KEY);
		return;
	}

	window.sessionStorage.setItem(STORAGE_KEY, safePath);
}

export function consumeNextPath() {
	const storedPath = window.sessionStorage.getItem(STORAGE_KEY);
	window.sessionStorage.removeItem(STORAGE_KEY);
	return sanitizeNextPath(storedPath) ?? DEFAULT_NEXT_PATH;
}
