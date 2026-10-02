export const EXPLORE_VIEW_MODES = ["map", "list"] as const;

export type ExploreViewMode = (typeof EXPLORE_VIEW_MODES)[number];

export const EXPLORE_VIEW_LABELS: Record<ExploreViewMode, string> = {
	map: "지도",
	list: "목록"
};

export const EXPLORE_PATH = "/explore";

const DEFAULT_VIEW: ExploreViewMode = "map";

export interface ExploreState {
	view: ExploreViewMode;
	query: string;
}

function isExploreViewMode(value: string | null): value is ExploreViewMode {
	return value !== null && EXPLORE_VIEW_MODES.includes(value as ExploreViewMode);
}

export function parseExploreState(searchParams: URLSearchParams) {
	const view = searchParams.get("view");

	return {
		view: isExploreViewMode(view) ? view : DEFAULT_VIEW,
		query: searchParams.get("q")?.trim() ?? ""
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

	const query = params.toString();

	return query === "" ? pathname : `${pathname}?${query}`;
}

export function buildExploreListPath() {
	return toExploreHref({ view: "list", query: "" });
}

export function buildExploreSearchPath(query: string) {
	return toExploreHref({ view: "list", query: query.trim() });
}
