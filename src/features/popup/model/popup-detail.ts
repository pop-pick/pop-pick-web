import type { KakaoLatLngLiteral } from "@/shared/lib/kakao-map/kakao-map-utils";
import {
	type KnownPopupReservationType,
	type PopupReservationType,
	type PopupSummary,
	toPopupCategory
} from "@/shared/model/popup";
import type { RecentPopup } from "@/shared/model/useRecentPopupsStore";

export interface PopupDetailResponse {
	popupId: number;
	title: string;
	description: string | null;
	imageUrls: string[] | null;
	interestCategoryId: number | null;
	startDate: string | null;
	endDate: string | null;
	openingHours: string | null;
	entryFee: number | null;
	addressRoad: string | null;
	addressJibun: string | null;
	latitude: number | null;
	longitude: number | null;
	reservationType: PopupReservationType;
	reservationUrl: string | null;
	wished: boolean;
}

export interface PopupDetail extends PopupSummary {
	imageUrls: string[];
	description: string | null;
	openingHours: string | null;
	address: string | null;
	position: KakaoLatLngLiteral | null;
	reservationUrl: string | null;
	entryFee: number | null;
}

export const RESERVATION_DETAIL_LABELS: Record<KnownPopupReservationType, string> = {
	NONE: "자유 입장",
	RESERVATION: "사전 예약 필요",
	WAITING: "현장 대기",
	BOTH: "사전 예약 및 현장 대기 가능"
};

function toPosition(latitude: number | null, longitude: number | null) {
	return latitude === null || longitude === null ? null : { lat: latitude, lng: longitude };
}

export function toPopupDetail(response: PopupDetailResponse) {
	const imageUrls = response.imageUrls ?? [];
	const detail: PopupDetail = {
		id: response.popupId,
		title: response.title,
		category: toPopupCategory(response.interestCategoryId),
		region: null,
		startDate: response.startDate,
		endDate: response.endDate,
		reservationType: response.reservationType,
		imageUrl: imageUrls[0] ?? null,
		isBookmarked: response.wished,
		imageUrls,
		description: response.description,
		openingHours: response.openingHours,
		address: response.addressRoad ?? response.addressJibun,
		position: toPosition(response.latitude, response.longitude),
		reservationUrl: response.reservationUrl,
		entryFee: response.entryFee
	};

	return detail;
}

export function pickRecentPopup(popup: PopupDetail) {
	return {
		id: popup.id,
		title: popup.title,
		category: popup.category,
		region: popup.region,
		startDate: popup.startDate,
		endDate: popup.endDate,
		reservationType: popup.reservationType,
		imageUrl: popup.imageUrl
	} satisfies RecentPopup;
}

export function pickPopupSummary(popup: PopupDetail) {
	return { ...pickRecentPopup(popup), isBookmarked: popup.isBookmarked } satisfies PopupSummary;
}
