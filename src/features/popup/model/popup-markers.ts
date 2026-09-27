import type { ExplorePopup } from "./explore-popup";
import { truncatePinLabel } from "./pin-label";

export function toPopupMarkers(popups: readonly ExplorePopup[]) {
	return popups.flatMap((popup) =>
		popup.position === null
			? []
			: [
					{
						id: String(popup.id),
						position: popup.position,
						title: popup.title,
						label: truncatePinLabel(popup.title)
					}
				]
	);
}
