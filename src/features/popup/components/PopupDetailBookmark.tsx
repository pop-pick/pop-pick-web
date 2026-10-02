"use client";

import { useEffect } from "react";

import { BookmarkSlot } from "@/shared/components/BookmarkSlot";

import { usePopupDetail } from "../hooks/usePopupDetail";
import type { PopupDetail } from "../model/popup-detail";

interface PopupDetailBookmarkProps {
	initialDetail: PopupDetail;
}

export function PopupDetailBookmark({ initialDetail }: PopupDetailBookmarkProps) {
	const { data: detail, error, dataUpdatedAt } = usePopupDetail(initialDetail);
	const isBookmarkConfirmed = dataUpdatedAt > 0;

	useEffect(() => {
		if (error !== null) {
			console.error(`[popup] 팝업 ${String(initialDetail.id)}의 찜 여부를 다시 받지 못했다`, error);
		}
	}, [error, initialDetail.id]);

	return (
		<BookmarkSlot
			popupId={detail.id}
			popupTitle={detail.title}
			isBookmarked={isBookmarkConfirmed ? detail.isBookmarked : null}
			size="lg"
		/>
	);
}
