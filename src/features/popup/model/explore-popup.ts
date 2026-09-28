import type { KakaoLatLngLiteral } from "@/shared/lib/kakao-map/kakao-map-utils";
import type { PopupSummary } from "@/shared/model/popup";

export interface ExplorePopup extends PopupSummary {
	position: KakaoLatLngLiteral | null;
	viewCount: number | null;
	registeredAt: string | null;
}
