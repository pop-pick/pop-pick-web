"use client";

import { useQueries, useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useEffect } from "react";

import { popupDetailQueryOptions } from "../api/get-popup-detail";
import { popupMapListQueryOptions } from "../api/get-popups";
import type { ExplorePopup } from "../model/explore-popup";
import { pickPopupSummary, type PopupDetail } from "../model/popup-detail";
import { toPopupMarkers } from "../model/popup-markers";

/** 핀은 찜 여부를 담지 않아 찜을 바꿔도 `combine`의 구조 공유로 같은 참조가 남는다. 참조가 바뀌면 지도가 핀 범위로 다시 맞춘다 */
function combineMapPopups(results: UseQueryResult<PopupDetail>[]) {
	const popups: ExplorePopup[] = [];

	for (const { data } of results) {
		if (data !== undefined && data.position !== null) {
			popups.push({ ...pickPopupSummary(data), position: data.position });
		}
	}

	const failedResults = results.filter((result) => result.isError);

	return {
		popups,
		markers: toPopupMarkers(popups),
		isPending: results.some((result) => result.isPending),
		error: failedResults[0]?.error ?? null,
		refetchFailedDetails: () => {
			for (const result of failedResults) {
				void result.refetch();
			}
		}
	};
}

/** 목록 응답에 좌표가 없어 팝업마다 상세를 받아 좌표가 있는 것만 핀으로 그린다. 백엔드에 목록 좌표를 요청해 두었다 */
export function usePopupsForMap(keyword: string) {
	const listQuery = useQuery(popupMapListQueryOptions(keyword));
	const details = useQueries({
		queries: listQuery.isSuccess ? listQuery.data.map((popup) => popupDetailQueryOptions(popup.id)) : [],
		combine: combineMapPopups
	});
	const error = listQuery.error ?? details.error;

	useEffect(() => {
		if (error !== null) {
			console.error("[popup] 지도에 그릴 팝업을 불러오지 못했다", error);
		}
	}, [error]);

	const retry = () => {
		void listQuery.refetch();
		details.refetchFailedDetails();
	};

	return {
		popups: details.popups,
		markers: details.markers,
		isPending: listQuery.isPending || details.isPending,
		isEmpty: listQuery.isSuccess && listQuery.data.length === 0,
		error,
		retry
	};
}
