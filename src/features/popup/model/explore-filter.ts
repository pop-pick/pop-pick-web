import type { ExploreSort, ExploreState } from "@/shared/model/explore-state";
import { POPUP_CATEGORY_LABELS } from "@/shared/model/popup";
import { REGION_LABELS } from "@/shared/model/region";

import type { ExplorePopup } from "./explore-popup";

type ExploreFilters = Pick<ExploreState, "query" | "region" | "sort">;

function normalizeKeyword(value: string) {
	return value.replace(/\s+/g, "").toLowerCase();
}

function buildSearchText(popup: ExplorePopup) {
	const parts = [
		popup.title,
		popup.region === null ? null : REGION_LABELS[popup.region],
		popup.category === null ? null : POPUP_CATEGORY_LABELS[popup.category]
	];

	return normalizeKeyword(parts.filter((part) => part !== null).join(""));
}

function compareDescending(a: number | string | null, b: number | string | null) {
	if (a === b) {
		return 0;
	}

	if (a === null) {
		return 1;
	}

	if (b === null) {
		return -1;
	}

	return a < b ? 1 : -1;
}

const SORT_KEYS: Record<ExploreSort, (popup: ExplorePopup) => number | string | null> = {
	latest: (popup) => popup.registeredAt,
	popular: (popup) => popup.viewCount
};

export function filterExplorePopups(popups: readonly ExplorePopup[], { query, region, sort }: ExploreFilters) {
	const keyword = normalizeKeyword(query);
	const sortKey = SORT_KEYS[sort];

	return popups
		.filter((popup) => region === null || popup.region === region)
		.filter((popup) => keyword === "" || buildSearchText(popup).includes(keyword))
		.toSorted((a, b) => compareDescending(sortKey(a), sortKey(b)) || a.id - b.id);
}
