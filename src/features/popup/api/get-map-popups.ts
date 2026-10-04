import { keepPreviousData, queryOptions } from "@tanstack/react-query";

import { api } from "@/shared/api/client";
import type { KakaoBoundsLiteral } from "@/shared/lib/kakao-map/kakao-map-utils";

import { type PopupMapItemResponse, toExplorePopup } from "../model/explore-popup";

function floorToThousandth(value: number) {
	return Math.floor(value * 1000) / 1000;
}

function ceilToThousandth(value: number) {
	return Math.ceil(value * 1000) / 1000;
}

/** 조금 움직인 지도가 같은 캐시를 쓰도록 영역을 소수 셋째 자리(약 110m)까지 바깥쪽으로 넓힌다. 안쪽으로 줄이면 가장자리 핀이 빠진다 */
function roundBoundsOutward({ swLat, swLng, neLat, neLng }: KakaoBoundsLiteral) {
	return {
		swLat: floorToThousandth(swLat),
		swLng: floorToThousandth(swLng),
		neLat: ceilToThousandth(neLat),
		neLng: ceilToThousandth(neLng)
	};
}

/** 조회수를 올리지 않고 비회원도 부르므로 토큰을 보내지 않는다 */
async function getMapPopups(keyword: string, bounds: KakaoBoundsLiteral, signal?: AbortSignal) {
	const trimmedKeyword = keyword.trim();
	const items = await api.get<PopupMapItemResponse[]>("/api/v1/popups/map", {
		query: { keyword: trimmedKeyword === "" ? null : trimmedKeyword, ...bounds },
		auth: false,
		signal
	});

	return items.map(toExplorePopup);
}

/** 지도를 움직이는 동안 이전 영역의 핀을 남겨 두어 핀이 깜빡이지 않는다 */
export function popupMapQueryOptions(keyword: string, bounds: KakaoBoundsLiteral) {
	const queryBounds = roundBoundsOutward(bounds);

	return queryOptions({
		queryKey: ["popups", "map", { keyword, ...queryBounds }],
		queryFn: ({ signal }) => getMapPopups(keyword, queryBounds, signal),
		placeholderData: keepPreviousData
	});
}
