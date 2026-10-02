"use client";

import type { ReactNode } from "react";

import { BookmarkSlotContext, type BookmarkSlotProps } from "@/shared/components/BookmarkSlot";

import { BookmarkButton } from "./BookmarkButton";

interface BookmarkSlotProviderProps {
	mode: "guest" | "member" | "pending";
	children: ReactNode;
}

export function BookmarkSlotProvider({ mode, children }: BookmarkSlotProviderProps) {
	const renderBookmark = ({ popupId, popupTitle, isBookmarked, size }: BookmarkSlotProps) => (
		<BookmarkButton mode={mode} popupId={popupId} popupTitle={popupTitle} isBookmarked={isBookmarked} size={size} />
	);

	return <BookmarkSlotContext value={renderBookmark}>{children}</BookmarkSlotContext>;
}
