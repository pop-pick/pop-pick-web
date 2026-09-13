import type { Region } from "./region";

export const POPUP_CATEGORIES = ["character", "fashion", "food", "art", "beauty", "game", "etc"] as const;

export type PopupCategory = (typeof POPUP_CATEGORIES)[number];

export const POPUP_CATEGORY_LABEL: Record<PopupCategory, string> = {
	character: "캐릭터/IP",
	fashion: "패션",
	food: "F&B",
	art: "전시/아트",
	beauty: "뷰티",
	game: "애니/게임",
	etc: "기타"
};

export const RESERVATION_TYPES = ["free", "waiting", "required"] as const;

export type ReservationType = (typeof RESERVATION_TYPES)[number];

export const RESERVATION_TYPE_LABEL: Record<ReservationType, string> = {
	free: "자유 입장",
	waiting: "현장 대기",
	required: "예약 필요"
};

/**
 * 카드가 그리는 값만 담은 화면용 타입이다.
 * 서버 응답 타입이 아니다. 백엔드가 팝업 필드를 확정하면 shared/api의 생성 타입으로 옮긴다
 */
export interface PopupCardItem {
	id: number;
	name: string;
	region: Region;
	category: PopupCategory;
	reservation: ReservationType;
	endsOn: string;
	reason?: string;
}
