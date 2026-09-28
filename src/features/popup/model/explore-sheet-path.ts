import { EXPLORE_PATH, type ExploreState, toExploreHref } from "@/shared/model/explore-state";

export function buildExploreSheetPath(popupId: number, state?: ExploreState) {
	const pathname = `${EXPLORE_PATH}/popups/${String(popupId)}`;
	return state === undefined ? pathname : toExploreHref(state, pathname);
}
