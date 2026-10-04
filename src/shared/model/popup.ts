export type PopupCategory = "character" | "fashion" | "food" | "art" | "beauty" | "game" | "lifestyle" | "etc";

export const POPUP_CATEGORY_LABELS: Record<PopupCategory, string> = {
	character: "캐릭터/IP",
	fashion: "패션/브랜드",
	food: "F&B",
	art: "전시/아트",
	beauty: "뷰티",
	game: "게임/엔터",
	lifestyle: "라이프스타일",
	etc: "기타"
};

/** 백엔드 interest_category 테이블의 id. 온보딩 관심 카테고리 선택지와 같은 표다 */
const POPUP_CATEGORY_BY_ID: Readonly<Record<number, PopupCategory>> = {
	1: "character",
	2: "fashion",
	3: "food",
	4: "art",
	5: "beauty",
	6: "game",
	7: "lifestyle",
	8: "etc"
};

export function toPopupCategory(interestCategoryId: number | null) {
	return interestCategoryId === null ? null : (POPUP_CATEGORY_BY_ID[interestCategoryId] ?? null);
}

export type PopupReservationType = "NONE" | "RESERVATION" | "WAITING" | "BOTH" | "UNKNOWN";

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
	areaName: string | null;
	startDate: string | null;
	endDate: string | null;
	reservationType: PopupReservationType;
	imageUrl: string | null;
	isBookmarked: boolean;
}

/** `GET /api/v1/popups`의 한 건. 탐색과 홈이 같은 목록 API를 읽는다 */
export interface PopupListItemResponse {
	popupId: number;
	imageUrl: string | null;
	interestCategoryId: number | null;
	areaName: string | null;
	title: string;
	endDate: string | null;
	reservationType: PopupReservationType;
	wished: boolean;
}

/** 목록 응답에 시작일이 없어 null이다 */
export function toPopupSummary(item: PopupListItemResponse) {
	const summary: PopupSummary = {
		id: item.popupId,
		title: item.title,
		category: toPopupCategory(item.interestCategoryId),
		areaName: item.areaName,
		startDate: null,
		endDate: item.endDate,
		reservationType: item.reservationType,
		imageUrl: item.imageUrl,
		isBookmarked: item.wished
	};

	return summary;
}
