"use client";

import { useEffect } from "react";

import type { PopupSummary } from "@/shared/model/popup";

import { useRecentPopups } from "../hooks/useRecentPopups";

interface RecentPopupRecorderProps {
	summary: PopupSummary;
}

export function RecentPopupRecorder({ summary }: RecentPopupRecorderProps) {
	const { loadStatus, addRecentPopup } = useRecentPopups();

	useEffect(() => {
		if (loadStatus === "failed") {
			console.warn(`[recent-popups] 기록을 불러오지 못해 팝업 ${summary.id}을 남기지 않았다`);
			return;
		}

		if (loadStatus === "ready") {
			addRecentPopup(summary);
		}
	}, [loadStatus, summary, addRecentPopup]);

	return null;
}
