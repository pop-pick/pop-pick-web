import type { PopupSummary } from "@/shared/model/popup";

export interface RecommendedPopupItem {
	popup: PopupSummary;
	reason: string | null;
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

export function pickRandomPopups(popups: readonly PopupSummary[], count: number) {
	const pool = [...popups];
	const picked: PopupSummary[] = [];

	while (picked.length < count && pool.length > 0) {
		picked.push(...pool.splice(Math.floor(Math.random() * pool.length), 1));
	}

	return picked;
}
