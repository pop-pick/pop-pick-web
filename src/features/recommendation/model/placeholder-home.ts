import { PLACEHOLDER_IMAGES } from "@/shared/lib/placeholder-images";
import type { PopupSummary } from "@/shared/model/popup";
import type { Region } from "@/shared/model/region";

import type { PopularPopupItem, RecommendedPopupItem } from "./home-popup";

const CINNAMOROLL_HOUSE: PopupSummary = {
	id: 2,
	title: "시나모롤 20주년 팝업 하우스",
	category: "character",
	region: "seongsu",
	startDate: "2024-10-12",
	endDate: "2024-10-26",
	reservationType: "RESERVATION",
	imageUrl: PLACEHOLDER_IMAGES.cinnamorollHouse
};

const MAISON_MARGIELA_SHOWROOM: PopupSummary = {
	id: 3,
	title: "메종 마르지엘라 신제품 쇼룸",
	category: "character",
	region: "yongsan",
	startDate: "2024-10-12",
	endDate: "2024-10-26",
	reservationType: "WAITING",
	imageUrl: PLACEHOLDER_IMAGES.maisonMargielaShowroom
};

const MUSINSA_SEASON_OFF: PopupSummary = {
	id: 4,
	title: "무신사 가을 시즌 오프 아울렛",
	category: "character",
	region: "hongdae",
	startDate: "2024-10-12",
	endDate: "2024-10-26",
	reservationType: "NONE",
	imageUrl: PLACEHOLDER_IMAGES.musinsaOutlet
};

const MINIONS_SPECIAL: PopupSummary = {
	id: 5,
	title: "미니언즈 특별전 팝업스토어",
	category: "character",
	region: "seongsu",
	startDate: "2024-10-12",
	endDate: "2024-10-26",
	reservationType: "RESERVATION",
	imageUrl: PLACEHOLDER_IMAGES.minionsPopup
};

export const PLACEHOLDER_RECOMMENDED_POPUPS: RecommendedPopupItem[] = [
	{
		popup: CINNAMOROLL_HOUSE,
		reason: "귀여운 캐릭터 굿즈와 테마 디저트가 가득한 공간이에요. 대기가 길어 예약 오픈을 꼭 확인하세요.",
		matchRate: 98,
		badge: "성수동 오늘 오픈"
	},
	{
		popup: MAISON_MARGIELA_SHOWROOM,
		reason: null,
		matchRate: null,
		badge: "성수동 오늘 오픈"
	},
	{
		popup: MUSINSA_SEASON_OFF,
		reason: null,
		matchRate: null,
		badge: "성수동 오늘 오픈"
	}
];

export const PLACEHOLDER_POPULAR_POPUPS: PopularPopupItem[] = [
	{
		popup: MINIONS_SPECIAL,
		highlight: "실시간 인기 1위",
		reviewSummary: { rating: 4.8, count: 120 }
	},
	{
		popup: MAISON_MARGIELA_SHOWROOM,
		highlight: "주말 대기 발생",
		reviewSummary: { rating: 4.55, count: 94 }
	},
	{
		popup: MUSINSA_SEASON_OFF,
		highlight: "10월 상시 운영",
		reviewSummary: { rating: 4.2, count: 154 }
	}
];

export const PLACEHOLDER_TRENDING_REGIONS: Region[] = ["seongsu", "yongsan", "hongdae", "yeouido"];
