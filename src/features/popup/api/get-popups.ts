import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";

import { getAccessToken } from "@/shared/api/auth-token";
import { api } from "@/shared/api/client";
import type { PageResponse } from "@/shared/api/types";
import { type PopupListItemResponse, type PopupSummary, toPopupSummary } from "@/shared/model/popup";

const LIST_PAGE_SIZE = 10;
const MAP_PAGE_SIZE = 50;

interface PopupListRequest {
	keyword: string;
	cursor: string | null;
	limit: number;
}

/** 찜 캐시 패치가 `id`와 `isBookmarked`로 팝업을 찾아서 응답을 `select`가 아니라 여기서 바꿔 캐시에 둔다 */
export async function getPopups({ keyword, cursor, limit }: PopupListRequest, signal?: AbortSignal) {
	const trimmedKeyword = keyword.trim();
	const page = await api.get<PageResponse<PopupListItemResponse>>("/api/v1/popups", {
		query: { keyword: trimmedKeyword === "" ? null : trimmedKeyword, cursor, limit },
		auth: getAccessToken() !== null,
		signal
	});
	const summaries: PageResponse<PopupSummary> = { ...page, content: page.content.map(toPopupSummary) };

	return summaries;
}

export function popupListQueryOptions(keyword: string) {
	return infiniteQueryOptions({
		queryKey: ["popups", "list", { keyword }],
		queryFn: ({ pageParam, signal }) => getPopups({ keyword, cursor: pageParam, limit: LIST_PAGE_SIZE }, signal),
		initialPageParam: null as string | null,
		getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.nextCursor : null),
		select: (data) => data.pages.flatMap((page) => page.content)
	});
}

export function popupMapListQueryOptions(keyword: string) {
	return queryOptions({
		queryKey: ["popups", "list", { keyword, limit: MAP_PAGE_SIZE }],
		queryFn: async ({ signal }) => {
			const page = await getPopups({ keyword, cursor: null, limit: MAP_PAGE_SIZE }, signal);
			return page.content;
		}
	});
}
