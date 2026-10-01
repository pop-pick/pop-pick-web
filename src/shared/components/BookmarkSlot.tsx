"use client";

import { createContext, type ReactNode, use } from "react";

export type BookmarkButtonSize = "sm" | "md" | "lg";

export interface BookmarkSlotProps {
	popupId: number;
	popupTitle: string;
	isBookmarked: boolean | null;
	size: BookmarkButtonSize;
}

export const BookmarkSlotContext = createContext<((props: BookmarkSlotProps) => ReactNode) | null>(null);

/** 기능끼리 부르지 않으려고 찜 버튼을 이 자리로 받는다. 라우트가 bookmark 기능의 Provider로 감싼다 */
export function BookmarkSlot(props: BookmarkSlotProps) {
	const renderBookmark = use(BookmarkSlotContext);

	if (renderBookmark === null) {
		throw new Error("BookmarkSlot은 BookmarkSlotProvider 안에서만 그린다. 라우트 파일이 감쌌는지 확인한다");
	}

	return renderBookmark(props);
}
