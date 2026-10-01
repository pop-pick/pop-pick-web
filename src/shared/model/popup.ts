import type { Region } from "./region";

export type PopupCategory = "fashion" | "beauty" | "character" | "game" | "tech" | "food" | "art" | "lifestyle";

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

type PopupReservationType = "NONE" | "RESERVATION" | "WAITING" | "BOTH" | "UNKNOWN";

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
