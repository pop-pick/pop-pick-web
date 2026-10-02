"use client";

import { useQuery } from "@tanstack/react-query";

import { popupDetailQueryOptions } from "../api/get-popup-detail";
import type { PopupDetail } from "../model/popup-detail";

/**
 * 서버 컴포넌트는 토큰 없이 받아 찜 여부가 늘 false라 마운트하자마자 다시 받아 사용자 값으로 덮는다.
 * 서버 값은 갱신 시각 0으로 넣어 두어 갱신 시각이 0보다 크면 클라이언트가 받거나 찜 패치로 바뀐 값이다
 */
export function usePopupDetail(initialDetail: PopupDetail) {
	return useQuery({
		...popupDetailQueryOptions(initialDetail.id),
		initialData: initialDetail,
		initialDataUpdatedAt: 0
	});
}
