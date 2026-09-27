import type { PopupSummary } from "@/shared/model/popup";

export interface RecommendedPopupItem {
	popup: PopupSummary;
	reason: string | null;
	matchRate: number | null;
	badge: string | null;
}

interface PopupReviewSummary {
	rating: number;
	count: number;
}

export interface PopularPopupItem {
	popup: PopupSummary;
	highlight: string | null;
	reviewSummary: PopupReviewSummary | null;
}
