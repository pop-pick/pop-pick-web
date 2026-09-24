const STORAGE_KEY = "pop-pick.next-path";

export const DEFAULT_NEXT_PATH = "/home";

export function sanitizeNextPath(value: string | null) {
	if (value === null || !value.startsWith("/") || value.startsWith("//")) {
		return null;
	}

	return value;
}

export function buildLoginPath(next: string) {
	const safePath = sanitizeNextPath(next) ?? DEFAULT_NEXT_PATH;

	return `/login?next=${encodeURIComponent(safePath)}`;
}

export function storeNextPath(next: string | null) {
	const safePath = sanitizeNextPath(next);
	if (safePath === null) {
		window.sessionStorage.removeItem(STORAGE_KEY);
		return;
	}

	window.sessionStorage.setItem(STORAGE_KEY, safePath);
}

export function consumeNextPath() {
	const stored = window.sessionStorage.getItem(STORAGE_KEY);
	window.sessionStorage.removeItem(STORAGE_KEY);

	return sanitizeNextPath(stored) ?? DEFAULT_NEXT_PATH;
}
