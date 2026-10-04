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
const AREA_ID_PATTERN = /^[1-9]\d*$/;

export interface ExploreState {
	view: ExploreViewMode;
	query: string;
	areaId: number | null;
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
	const area = searchParams.get("area");
	const sort = searchParams.get("sort");
	const state: ExploreState = {
		view: isExploreViewMode(view) ? view : DEFAULT_VIEW,
		query: searchParams.get("q")?.trim() ?? "",
		areaId: area !== null && AREA_ID_PATTERN.test(area) ? Number(area) : null,
		sort: isExploreSort(sort) ? sort : DEFAULT_SORT
	};

	return state;
}

export function toExploreHref(state: ExploreState, pathname = EXPLORE_PATH) {
	const params = new URLSearchParams();

	if (state.view !== DEFAULT_VIEW) {
		params.set("view", state.view);
	}

	if (state.query !== "") {
		params.set("q", state.query);
	}

	if (state.areaId !== null) {
		params.set("area", String(state.areaId));
	}

	if (state.sort !== DEFAULT_SORT) {
		params.set("sort", state.sort);
	}

	const query = params.toString();

	return query === "" ? pathname : `${pathname}?${query}`;
}

export function buildExploreListPath() {
	return toExploreHref({ view: "list", query: "", areaId: null, sort: DEFAULT_SORT });
}

export function buildExploreSearchPath(query: string) {
	return toExploreHref({ view: "list", query: query.trim(), areaId: null, sort: DEFAULT_SORT });
}
