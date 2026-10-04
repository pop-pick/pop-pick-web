import { queryOptions } from "@tanstack/react-query";

import { api } from "@/shared/api/client";
import { type PopupListItemResponse, toPopupSummary } from "@/shared/model/popup";

async function getPopularPopups(signal?: AbortSignal) {
	const items = await api.get<PopupListItemResponse[]>("/api/v1/popups/popular", { auth: false, signal });
	return items.map(toPopupSummary);
}

export function popularPopupsQueryOptions() {
	return queryOptions({
		queryKey: ["recommendations", "popular"],
		queryFn: ({ signal }) => getPopularPopups(signal)
	});
}
