import type { Region } from "./region";

export const POPUP_CATEGORIES = ["fashion", "beauty", "character", "game", "tech", "food", "art", "lifestyle"] as const;

export type PopupCategory = (typeof POPUP_CATEGORIES)[number];

export const POPUP_CATEGORY_LABELS: Record<PopupCategory, string> = {
	fashion: "패션/브랜드",
	beauty: "뷰티",
	character: "캐릭터/IP",
	game: "게임/엔터",
	tech: "테크/가전",
	food: "F&B",
	art: "전시/아트",
	lifestyle: "라이프스타일"
};

export const RESERVATION_TYPES = ["free", "waiting", "required"] as const;

export type ReservationType = (typeof RESERVATION_TYPES)[number];

export const RESERVATION_TYPE_LABELS: Record<ReservationType, string> = {
	free: "자유 입장",
	waiting: "현장 대기",
	required: "예약 필요"
};

export interface PopupCardItem {
	id: number;
	name: string;
	region: Region;
	category: PopupCategory;
	reservation: ReservationType;
	endsOn: string;
	reason?: string;
}

export const POPUP_RESERVATION_TYPES = ["NONE", "RESERVATION", "WAITING", "BOTH", "UNKNOWN"] as const;

export type PopupReservationType = (typeof POPUP_RESERVATION_TYPES)[number];

export type KnownPopupReservationType = Exclude<PopupReservationType, "UNKNOWN">;

export const RESERVATION_SHORT_LABELS: Record<KnownPopupReservationType, string> = {
	NONE: "자유입장",
	RESERVATION: "예약필요",
	WAITING: "현장대기",
	BOTH: "예약 및 현장대기"
};

export interface PopupSummary {
	id: number;
	title: string;
	category: PopupCategory | null;
	region: Region | null;
	startDate: string | null;
	endDate: string | null;
	reservationType: PopupReservationType;
	imageUrl: string | null;
}
