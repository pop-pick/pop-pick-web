"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import type { KakaoBoundsLiteral } from "@/shared/lib/kakao-map/kakao-map-utils";

import { popupMapQueryOptions } from "../api/get-map-popups";
import type { ExplorePopup } from "../model/explore-popup";
import { toPopupMarkers } from "../model/popup-markers";

const NO_BOUNDS: KakaoBoundsLiteral = { swLat: 0, swLng: 0, neLat: 0, neLng: 0 };
const NO_POPUPS: ExplorePopup[] = [];
const NO_MARKERS = toPopupMarkers(NO_POPUPS);

/** 데이터가 같으면 같은 참조가 남아 지도가 렌더마다 핀을 다시 그리지 않는다 */
function selectMapView(popups: ExplorePopup[]) {
	return { popups, markers: toPopupMarkers(popups) };
}

export function useMapPopups(keyword: string, bounds: KakaoBoundsLiteral | null) {
	const { data, error, isPending, isPlaceholderData, isSuccess, refetch } = useQuery({
		...popupMapQueryOptions(keyword, bounds ?? NO_BOUNDS),
		select: selectMapView,
		enabled: bounds !== null
	});

	useEffect(() => {
		if (error !== null) {
			console.error("[popup] 지도에 그릴 팝업을 불러오지 못했다", error);
		}
	}, [error]);

	const popups = data?.popups ?? NO_POPUPS;

	const retry = () => {
		void refetch();
	};

	return {
		popups,
		markers: data?.markers ?? NO_MARKERS,
		isPending: bounds !== null && isPending,
		isEmpty: isSuccess && !isPlaceholderData && popups.length === 0,
		error,
		retry
	};
}
