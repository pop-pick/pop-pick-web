import type { KakaoLatLngLiteral } from "@/shared/lib/kakao-map/kakao-map-utils";
import { type PopupReservationType, type PopupSummary, toPopupCategory } from "@/shared/model/popup";

/** 지도 응답에는 찜 여부가 없어 null이다. 찜하지 않은 것(false)과 구분해 하트가 모름 상태로 그려진다 */
export interface ExplorePopup extends Omit<PopupSummary, "isBookmarked"> {
	isBookmarked: null;
	position: KakaoLatLngLiteral;
}

export interface PopupMapItemResponse {
	popupId: number;
	latitude: number;
	longitude: number;
	title: string;
	imageUrl: string | null;
	interestCategoryId: number | null;
	areaName: string | null;
	endDate: string | null;
	reservationType: PopupReservationType;
}

/** 지도 응답에 시작일이 없어 null이다 */
export function toExplorePopup(item: PopupMapItemResponse) {
	const popup: ExplorePopup = {
		id: item.popupId,
		title: item.title,
		category: toPopupCategory(item.interestCategoryId),
		areaName: item.areaName,
		startDate: null,
		endDate: item.endDate,
		reservationType: item.reservationType,
		imageUrl: item.imageUrl,
		isBookmarked: null,
		position: { lat: item.latitude, lng: item.longitude }
	};

	return popup;
}
