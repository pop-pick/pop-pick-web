import { DEFAULT_NEXT_PATH, sanitizeNextPath } from "@/shared/model/login-path";

const STORAGE_KEY = "pop-pick.next-path";

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
