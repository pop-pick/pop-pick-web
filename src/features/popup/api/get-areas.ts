import { queryOptions } from "@tanstack/react-query";

import { api } from "@/shared/api/client";

export interface PopupArea {
	id: number;
	name: string;
}

interface AreaResponse {
	id: number;
	area: string;
}

/** 지역 표는 온보딩의 선호 지역 선택지와 같은 백엔드 목록이다. 기능끼리 부르지 않으려고 여기서 따로 받는다 */
export function areaListQueryOptions() {
	return queryOptions({
		queryKey: ["popups", "areas"],
		queryFn: ({ signal }) => api.get<AreaResponse[]>("/api/v1/onboardings/favorite-areas", { auth: false, signal }),
		select: (areas) => areas.map((area): PopupArea => ({ id: area.id, name: area.area })),
		staleTime: Infinity
	});
}
