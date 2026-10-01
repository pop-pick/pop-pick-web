import { isRegion, type Region } from "@/shared/model/region";

export const EXPLORE_VIEW_MODES = ["map", "list"] as const;

export type ExploreViewMode = (typeof EXPLORE_VIEW_MODES)[number];

export const EXPLORE_VIEW_LABELS: Record<ExploreViewMode, string> = {
	map: "지도",
	list: "목록"
};

export const EXPLORE_SORTS = ["latest", "popular"] as const;

export type ExploreSort = (typeof EXPLORE_SORTS)[number];

export const EXPLORE_SORT_LABELS: Record<ExploreSort, string> = {
	latest: "최신순",
	popular: "인기순"
};

export const EXPLORE_PATH = "/explore";

const DEFAULT_VIEW: ExploreViewMode = "map";
const DEFAULT_SORT: ExploreSort = "popular";

export interface ExploreState {
	view: ExploreViewMode;
	query: string;
	region: Region | null;
	sort: ExploreSort;
}

function isExploreViewMode(value: string | null): value is ExploreViewMode {
	return value !== null && EXPLORE_VIEW_MODES.includes(value as ExploreViewMode);
}

function isExploreSort(value: string | null): value is ExploreSort {
	return value !== null && EXPLORE_SORTS.includes(value as ExploreSort);
}

export function parseExploreState(searchParams: URLSearchParams) {
	const view = searchParams.get("view");
	const region = searchParams.get("region");
	const sort = searchParams.get("sort");

	return {
		view: isExploreViewMode(view) ? view : DEFAULT_VIEW,
		query: searchParams.get("q")?.trim() ?? "",
		region: isRegion(region) ? region : null,
		sort: isExploreSort(sort) ? sort : DEFAULT_SORT
	};
}

export function toExploreHref(state: ExploreState, pathname = EXPLORE_PATH) {
	const params = new URLSearchParams();

	if (state.view !== DEFAULT_VIEW) {
		params.set("view", state.view);
	}

	if (state.query !== "") {
		params.set("q", state.query);
	}

	if (state.region !== null) {
		params.set("region", state.region);
	}

	if (state.sort !== DEFAULT_SORT) {
		params.set("sort", state.sort);
	}

	const query = params.toString();

	return query === "" ? pathname : `${pathname}?${query}`;
}

/** 목록 보기로 여는 탐색 주소. 검색어 없이 지역과 정렬만 고른다 */
export function buildExploreListPath(region: Region | null = null) {
	return toExploreHref({ view: "list", query: "", region, sort: DEFAULT_SORT });
}

export function buildExploreSearchPath(query: string) {
	return toExploreHref({ view: "list", query: query.trim(), region: null, sort: DEFAULT_SORT });
}
