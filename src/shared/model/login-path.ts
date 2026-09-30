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
