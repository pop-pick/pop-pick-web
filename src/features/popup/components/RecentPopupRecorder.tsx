"use client";

import { useEffect } from "react";

import { useRecentPopups } from "../hooks/useRecentPopups";
import { pickRecentPopup, type PopupDetail } from "../model/popup-detail";

interface RecentPopupRecorderProps {
	initialDetail: PopupDetail;
}

export function RecentPopupRecorder({ initialDetail }: RecentPopupRecorderProps) {
	const { loadStatus, addRecentPopup } = useRecentPopups();
	const recentPopup = pickRecentPopup(initialDetail);

	useEffect(() => {
		if (loadStatus === "failed") {
			console.warn(`[recent-popups] 기록을 불러오지 못해 팝업 ${recentPopup.id}을 남기지 않았다`);
			return;
		}

		if (loadStatus === "ready") {
			addRecentPopup(recentPopup);
		}
	}, [loadStatus, recentPopup, addRecentPopup]);

	return null;
}
