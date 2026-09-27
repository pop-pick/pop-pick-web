import type { KakaoLatLngLiteral } from "@/shared/lib/kakao-map/kakao-map-utils";

import type { ExplorePopup } from "./explore-popup";
import { PLACEHOLDER_POPUP_DETAILS } from "./placeholder-details";

interface PlaceholderPlacement {
	position: KakaoLatLngLiteral;
	registeredAt: string;
}

const PLACEHOLDER_PLACEMENTS: Record<number, PlaceholderPlacement> = {
	1: { position: { lat: 37.5433, lng: 127.056 }, registeredAt: "2024-10-01" },
	2: { position: { lat: 37.5447, lng: 127.0539 }, registeredAt: "2024-10-03" },
	3: { position: { lat: 37.5298, lng: 126.9647 }, registeredAt: "2024-10-02" },
	4: { position: { lat: 37.5563, lng: 126.9236 }, registeredAt: "2024-10-06" },
	5: { position: { lat: 37.5441, lng: 127.0572 }, registeredAt: "2024-10-08" },
	6: { position: { lat: 37.5575, lng: 126.925 }, registeredAt: "2024-10-10" },
	7: { position: { lat: 37.532, lng: 126.97 }, registeredAt: "2024-10-12" },
	8: { position: { lat: 37.5259, lng: 126.9284 }, registeredAt: "2024-09-28" }
};

export const PLACEHOLDER_EXPLORE_POPUPS: ExplorePopup[] = PLACEHOLDER_POPUP_DETAILS.map((detail) => {
	const placement = PLACEHOLDER_PLACEMENTS[detail.id];

	if (placement === undefined) {
		throw new Error(`[popup] 탐색 임시 좌표가 없다: ${String(detail.id)}`);
	}

	return {
		id: detail.id,
		title: detail.title,
		category: detail.category,
		region: detail.region,
		startDate: detail.startDate,
		endDate: detail.endDate,
		reservationType: detail.reservationType,
		imageUrl: detail.imageUrl,
		viewCount: detail.viewCount,
		position: placement.position,
		registeredAt: placement.registeredAt
	};
});
