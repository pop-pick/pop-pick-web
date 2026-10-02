import { infiniteQueryOptions } from "@tanstack/react-query";

import { api } from "@/shared/api/client";
import type { PageResponse } from "@/shared/api/types";
import { type PopupReservationType, toPopupCategory } from "@/shared/model/popup";

import type { BookmarkedPopup } from "../model/bookmark";

const PAGE_SIZE = 10;

interface WishResponse {
	popupId: number;
	imageUrl: string | null;
	interestCategoryId: number | null;
	title: string;
	startDate: string | null;
	endDate: string | null;
	reservationType: PopupReservationType;
	ended: boolean;
	wishedAt: string;
}

function toBookmarkedPopup(wish: WishResponse) {
	const popup: BookmarkedPopup = {
		id: wish.popupId,
		title: wish.title,
		category: toPopupCategory(wish.interestCategoryId),
		region: null,
		startDate: wish.startDate,
		endDate: wish.endDate,
		reservationType: wish.reservationType,
		imageUrl: wish.imageUrl,
		isBookmarked: true,
		isEnded: wish.ended
	};

	return popup;
}

export async function getBookmarks(cursor: string | null, signal?: AbortSignal) {
	const page = await api.get<PageResponse<WishResponse>>("/api/v1/wishes", {
		query: { cursor, limit: PAGE_SIZE },
		signal
	});

	return { ...page, content: page.content.map(toBookmarkedPopup) };
}

/** 찜 토글이 캐시 안의 팝업 사본을 id와 isBookmarked로 찾아 바꾸므로 select가 아니라 queryFn에서 모델로 바꿔 둔다 */
export function bookmarkListQueryOptions() {
	return infiniteQueryOptions({
		queryKey: ["bookmarks", "list"],
		queryFn: ({ pageParam, signal }) => getBookmarks(pageParam, signal),
		initialPageParam: null as string | null,
		getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.nextCursor : null),
		select: (data) => data.pages.flatMap((page) => page.content)
	});
}
