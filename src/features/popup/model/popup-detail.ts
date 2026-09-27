import type { KnownPopupReservationType, PopupSummary } from "@/shared/model/popup";

export interface PopupDetail extends PopupSummary {
	imageUrls: string[];
	description: string | null;
	openingHours: string | null;
	addressRoad: string | null;
	reservationUrl: string | null;
	entryFee: number | null;
	viewCount: number | null;
	matchRate: number | null;
}

export const RESERVATION_DETAIL_LABELS: Record<KnownPopupReservationType, string> = {
	NONE: "자유 입장",
	RESERVATION: "사전 예약 필요",
	WAITING: "현장 대기",
	BOTH: "사전 예약 및 현장 대기 가능"
};
