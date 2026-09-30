"use client";

import { type ReactNode, useCallback } from "react";

import { BookmarkSlotContext, type BookmarkSlotProps } from "@/shared/components/BookmarkSlot";

import { BookmarkButton } from "./BookmarkButton";

interface BookmarkSlotProviderProps {
	mode: "guest" | "member" | "pending";
	children: ReactNode;
}

export function BookmarkSlotProvider({ mode, children }: BookmarkSlotProviderProps) {
	const renderBookmark = useCallback(
		({ popupTitle, size }: BookmarkSlotProps) => <BookmarkButton mode={mode} popupTitle={popupTitle} size={size} />,
		[mode]
	);

	return <BookmarkSlotContext value={renderBookmark}>{children}</BookmarkSlotContext>;
}
