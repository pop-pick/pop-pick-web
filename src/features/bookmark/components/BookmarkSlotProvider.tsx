"use client";

import type { ReactNode } from "react";

import { BookmarkSlotContext, type BookmarkSlotProps } from "@/shared/components/BookmarkSlot";

import type { BookmarkMode } from "../model/bookmark";
import { BookmarkButton } from "./BookmarkButton";

interface BookmarkSlotProviderProps {
	mode: BookmarkMode;
	children: ReactNode;
}

export function BookmarkSlotProvider({ mode, children }: BookmarkSlotProviderProps) {
	const renderBookmark = ({ popupId, popupTitle, isBookmarked, size }: BookmarkSlotProps) => (
		<BookmarkButton mode={mode} popupId={popupId} popupTitle={popupTitle} isBookmarked={isBookmarked} size={size} />
	);

	return <BookmarkSlotContext value={renderBookmark}>{children}</BookmarkSlotContext>;
}
