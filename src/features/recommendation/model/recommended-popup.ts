import type { PopupSummary } from "@/shared/model/popup";

export interface RecommendedPopupItem {
	popup: PopupSummary;
	reason: string | null;
}
