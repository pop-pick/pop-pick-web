"use client";

import { type ReactNode, useCallback } from "react";

import { BookmarkSlotContext, type BookmarkSlotProps } from "@/shared/components/BookmarkSlot";

import { BookmarkButton } from "./BookmarkButton";

interface GuestBookmarkSlotProviderProps {
	mode: "guest";
	loginHref: string;
	children: ReactNode;
}

interface InactiveBookmarkSlotProviderProps {
	mode: "member" | "pending";
	loginHref?: never;
	children: ReactNode;
}

type BookmarkSlotProviderProps = GuestBookmarkSlotProviderProps | InactiveBookmarkSlotProviderProps;

export function BookmarkSlotProvider({ mode, loginHref, children }: BookmarkSlotProviderProps) {
	const renderBookmark = useCallback(
		({ popupTitle, size }: BookmarkSlotProps) =>
			mode === "guest" ? (
				<BookmarkButton mode="guest" popupTitle={popupTitle} loginHref={loginHref} size={size} />
			) : (
				<BookmarkButton mode={mode} popupTitle={popupTitle} size={size} />
			),
		[mode, loginHref]
	);

	return <BookmarkSlotContext value={renderBookmark}>{children}</BookmarkSlotContext>;
}
