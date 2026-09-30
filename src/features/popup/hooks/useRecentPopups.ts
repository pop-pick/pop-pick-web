"use client";

import { useEffect } from "react";

import { loadRecentPopups, useRecentPopupsStore } from "@/shared/model/useRecentPopupsStore";

/** 서버 렌더에는 sessionStorage가 없어 첫 렌더를 비워 두고 마운트 뒤에 기록을 불러온다 */
export function useRecentPopups() {
	const items = useRecentPopupsStore((state) => state.items);
	const loadStatus = useRecentPopupsStore((state) => state.loadStatus);
	const addRecentPopup = useRecentPopupsStore((state) => state.addRecentPopup);

	useEffect(() => {
		if (useRecentPopupsStore.getState().loadStatus === "loading") {
			loadRecentPopups();
		}
	}, []);

	return { items, loadStatus, addRecentPopup };
}
