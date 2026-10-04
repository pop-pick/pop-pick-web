import { queryOptions } from "@tanstack/react-query";

import { api } from "@/shared/api/client";
import { type PopupListItemResponse, toPopupSummary } from "@/shared/model/popup";

import type { RecommendedPopupItem } from "../model/recommended-popup";

const RECOMMENDED_STALE_TIME_MS = 5 * 60 * 1000;

async function getRecommendedPopups(signal?: AbortSignal) {
	const items = await api.get<PopupListItemResponse[]>("/api/v1/popups/recommended", { auth: true, signal });
	return items.map((item): RecommendedPopupItem => ({ popup: toPopupSummary(item), reason: null }));
}

export function recommendedPopupsQueryOptions() {
	return queryOptions({
		queryKey: ["recommendations", "home"],
		queryFn: ({ signal }) => getRecommendedPopups(signal),
		staleTime: RECOMMENDED_STALE_TIME_MS
	});
}
