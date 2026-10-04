import { infiniteQueryOptions } from "@tanstack/react-query";

import { getAccessToken } from "@/shared/api/auth-token";
import { api } from "@/shared/api/client";
import type { PageResponse } from "@/shared/api/types";
import type { ExploreSort } from "@/shared/model/explore-state";
import { type PopupListItemResponse, type PopupSummary, toPopupSummary } from "@/shared/model/popup";

const LIST_PAGE_SIZE = 10;

interface PopupListFilter {
	keyword: string;
	areaId: number | null;
	sort: ExploreSort;
}

/** 인기순은 페이지를 넘기는 사이 조회수가 바뀌면 같은 팝업이 다음 페이지에 또 올 수 있다. 먼저 온 것을 남긴다 */
function keepFirstOfEachId(popups: PopupSummary[]) {
	const seenIds = new Set<number>();

	return popups.filter((popup) => {
		const isFirst = !seenIds.has(popup.id);
		seenIds.add(popup.id);
		return isFirst;
	});
}

/** 찜 캐시 패치가 `id`와 `isBookmarked`로 팝업을 찾아서 응답을 `select`가 아니라 여기서 바꿔 캐시에 둔다 */
async function getPopups({ keyword, areaId, sort }: PopupListFilter, cursor: string | null, signal?: AbortSignal) {
	const trimmedKeyword = keyword.trim();
	const page = await api.get<PageResponse<PopupListItemResponse>>("/api/v1/popups", {
		query: { keyword: trimmedKeyword === "" ? null : trimmedKeyword, areaId, sort, cursor, limit: LIST_PAGE_SIZE },
		auth: getAccessToken() !== null,
		signal
	});
	const summaries: PageResponse<PopupSummary> = { ...page, content: page.content.map(toPopupSummary) };

	return summaries;
}

export function popupListQueryOptions(filter: PopupListFilter) {
	return infiniteQueryOptions({
		queryKey: ["popups", "list", filter],
		queryFn: ({ pageParam, signal }) => getPopups(filter, pageParam, signal),
		initialPageParam: null as string | null,
		getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.nextCursor : null),
		select: (data) => keepFirstOfEachId(data.pages.flatMap((page) => page.content))
	});
}
