import type { ExplorePopup } from "./explore-popup";

const PIN_LABEL_MAX_CHARS = 7;
const ELLIPSIS = "…";

function truncatePinLabel(title: string) {
	const chars = Array.from(title);

	if (chars.length <= PIN_LABEL_MAX_CHARS) {
		return title;
	}

	return `${chars.slice(0, PIN_LABEL_MAX_CHARS).join("").trimEnd()}${ELLIPSIS}`;
}

export function toPopupMarkers(popups: readonly ExplorePopup[]) {
	return popups.map((popup) => ({
		id: String(popup.id),
		position: popup.position,
		title: popup.title,
		label: truncatePinLabel(popup.title)
	}));
}
