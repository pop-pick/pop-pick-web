import { isRegion, type Region } from "@/shared/model/region";

export const EXPLORE_VIEW_MODES = ["map", "list"] as const;

export type ExploreViewMode = (typeof EXPLORE_VIEW_MODES)[number];

export const EXPLORE_VIEW_LABELS: Record<ExploreViewMode, string> = {
	map: "지도",
	list: "목록"
};

export interface ExploreState {
	view: ExploreViewMode;
	/** 홈의 지역 칩에서 들어올 때만 값이 있다. 화면 안에서 바꾸는 자리는 없다 */
	region: Region | null;
}

function isExploreViewMode(value: string | null): value is ExploreViewMode {
	return value !== null && EXPLORE_VIEW_MODES.includes(value as ExploreViewMode);
}

export function parseExploreState(searchParams: URLSearchParams) {
	const view = searchParams.get("view");
	const region = searchParams.get("region");

	return {
		view: isExploreViewMode(view) ? view : "map",
		region: isRegion(region) ? region : null
	};
}

export function serializeExploreState(state: ExploreState) {
	const params = new URLSearchParams();

	if (state.view !== "map") {
		params.set("view", state.view);
	}

	if (state.region !== null) {
		params.set("region", state.region);
	}

	return params;
}
