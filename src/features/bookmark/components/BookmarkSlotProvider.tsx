"use client";

import type { ReactNode } from "react";

import { BookmarkSlotContext, type BookmarkSlotProps } from "@/shared/components/BookmarkSlot";

import { BookmarkButton } from "./BookmarkButton";

interface BookmarkSlotProviderProps {
	mode: "guest" | "member" | "pending";
	children: ReactNode;
}

export function BookmarkSlotProvider({ mode, children }: BookmarkSlotProviderProps) {
	const renderBookmark = ({ popupTitle, size }: BookmarkSlotProps) => (
		<BookmarkButton mode={mode} popupTitle={popupTitle} size={size} />
	);

	return <BookmarkSlotContext value={renderBookmark}>{children}</BookmarkSlotContext>;
}
