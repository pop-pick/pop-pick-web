import type { QueryClient } from "@tanstack/react-query";

const BOOKMARK_CACHE_ROOTS = ["popups", "recommendations", "bookmarks"] as const;

function patchBookmarkInValue(value: unknown, popupId: number, isBookmarked: boolean) {
	if (Array.isArray(value)) {
		const patched: unknown[] = value.map((item: unknown) => patchBookmarkInValue(item, popupId, isBookmarked));
		return patched.some((item, index) => item !== value[index]) ? patched : value;
	}

	if (typeof value !== "object" || value === null) {
		return value;
	}

	const patched: Record<string, unknown> = {};
	let hasChanged = false;

	for (const [key, child] of Object.entries(value)) {
		const patchedChild: unknown = patchBookmarkInValue(child, popupId, isBookmarked);
		hasChanged ||= patchedChild !== child;
		patched[key] = patchedChild;
	}

	if (patched.id === popupId && typeof patched.isBookmarked === "boolean" && patched.isBookmarked !== isBookmarked) {
		patched.isBookmarked = isBookmarked;
		hasChanged = true;
	}

	return hasChanged ? patched : value;
}

export function patchBookmarkInCaches(queryClient: QueryClient, popupId: number, isBookmarked: boolean) {
	for (const root of BOOKMARK_CACHE_ROOTS) {
		queryClient.setQueriesData({ queryKey: [root] }, (data: unknown) => {
			const patched = patchBookmarkInValue(data, popupId, isBookmarked);
			return patched === data ? undefined : patched;
		});
	}
}
