import type { PopupSummary } from "./popup";

export const RECENT_POPUP_LIMIT = 10;

export function prependRecentPopup(recentPopups: readonly PopupSummary[], popup: PopupSummary) {
	const others = recentPopups.filter((recent) => recent.id !== popup.id);
	return [popup, ...others].slice(0, RECENT_POPUP_LIMIT);
}
