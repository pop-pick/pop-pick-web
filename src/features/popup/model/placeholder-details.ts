import { PLACEHOLDER_IMAGES } from "@/shared/lib/placeholder-images";

import type { PopupDetail } from "./popup-detail";

const PLACEHOLDER_POPUP_DETAILS: PopupDetail[] = [
	{
		id: 1,
		title: "성수 어글리 토이 팝업 : 가을의 위로",
		category: "character",
		region: "seongsu",
		startDate: "2024-10-12",
		endDate: "2024-10-26",
		reservationType: "BOTH",
		imageUrl: PLACEHOLDER_IMAGES.uglyToyAutumn,
		imageUrls: [
			PLACEHOLDER_IMAGES.uglyToyAutumn,
			PLACEHOLDER_IMAGES.minionsPopup,
			PLACEHOLDER_IMAGES.cinnamorollHouse,
			PLACEHOLDER_IMAGES.maisonMargielaShowroom
		],
		description:
			"독특한 개성의 수제 인형 캐릭터 브랜드 '어글리 코리아'의 두 번째 단독 가을 시즌 테마 팝업스토어입니다.",
		openingHours: "매일 11:00 ~ 20:00",
		addressRoad: "서울 성동구 연무장길 15 1층",
		reservationUrl: "https://example.com/reservation",
		entryFee: 0,
		viewCount: 12000,
		matchRate: 98
	},
	{
		id: 2,
		title: "시나모롤 20주년 팝업 하우스",
		category: "character",
		region: "seongsu",
		startDate: "2024-10-12",
		endDate: "2024-10-26",
		reservationType: "RESERVATION",
		imageUrl: PLACEHOLDER_IMAGES.cinnamorollHouse,
		imageUrls: [PLACEHOLDER_IMAGES.cinnamorollHouse],
		description: null,
		openingHours: null,
		addressRoad: null,
		reservationUrl: null,
		entryFee: null,
		viewCount: null,
		matchRate: null
	},
	{
		id: 3,
		title: "메종 마르지엘라 신제품 쇼룸",
		category: "character",
		region: "yongsan",
		startDate: "2024-10-12",
		endDate: "2024-10-26",
		reservationType: "WAITING",
		imageUrl: PLACEHOLDER_IMAGES.maisonMargielaShowroom,
		imageUrls: [PLACEHOLDER_IMAGES.maisonMargielaShowroom],
		description: null,
		openingHours: null,
		addressRoad: null,
		reservationUrl: null,
		entryFee: null,
		viewCount: null,
		matchRate: null
	},
	{
		id: 4,
		title: "무신사 가을 시즌 오프 아울렛",
		category: "character",
		region: "hongdae",
		startDate: "2024-10-12",
		endDate: "2024-10-26",
		reservationType: "NONE",
		imageUrl: PLACEHOLDER_IMAGES.musinsaOutlet,
		imageUrls: [PLACEHOLDER_IMAGES.musinsaOutlet],
		description: null,
		openingHours: null,
		addressRoad: null,
		reservationUrl: null,
		entryFee: null,
		viewCount: null,
		matchRate: null
	},
	{
		id: 5,
		title: "미니언즈 특별전 팝업스토어",
		category: "character",
		region: "seongsu",
		startDate: "2024-10-12",
		endDate: "2024-10-26",
		reservationType: "RESERVATION",
		imageUrl: PLACEHOLDER_IMAGES.minionsPopup,
		imageUrls: [PLACEHOLDER_IMAGES.minionsPopup],
		description: null,
		openingHours: null,
		addressRoad: null,
		reservationUrl: null,
		entryFee: null,
		viewCount: null,
		matchRate: null
	},
	{
		id: 6,
		title: "노마드 가을 팝업",
		category: "fashion",
		region: "hongdae",
		startDate: "2024-10-19",
		endDate: "2024-11-02",
		reservationType: "NONE",
		imageUrl: null,
		imageUrls: [],
		description: null,
		openingHours: null,
		addressRoad: null,
		reservationUrl: null,
		entryFee: null,
		viewCount: null,
		matchRate: null
	},
	{
		id: 7,
		title: "모노에디션 미디어 아트",
		category: "art",
		region: "yongsan",
		startDate: "2024-10-25",
		endDate: "2024-11-15",
		reservationType: "WAITING",
		imageUrl: null,
		imageUrls: [],
		description: null,
		openingHours: null,
		addressRoad: null,
		reservationUrl: null,
		entryFee: null,
		viewCount: null,
		matchRate: null
	}
];

export function findPlaceholderPopupDetail(popupId: number) {
	return PLACEHOLDER_POPUP_DETAILS.find((detail) => detail.id === popupId);
}
