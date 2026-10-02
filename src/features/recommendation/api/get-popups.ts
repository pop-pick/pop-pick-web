import { queryOptions } from "@tanstack/react-query";

import { getAccessToken } from "@/shared/api/auth-token";
import { api } from "@/shared/api/client";
import type { PageResponse } from "@/shared/api/types";
import { type PopupListItemResponse, toPopupSummary } from "@/shared/model/popup";

import { pickRandomPopups } from "../model/home-popup";

const POPULAR_LIMIT = 3;
const PICK_POOL_LIMIT = 50;
const PICK_COUNT = 3;
const PICK_STALE_TIME_MS = 5 * 60 * 1000;

async function getPopups(limit: number, signal?: AbortSignal) {
	const page = await api.get<PageResponse<PopupListItemResponse>>("/api/v1/popups", {
		query: { limit },
		auth: getAccessToken() !== null,
		signal
	});

	return page.content.map(toPopupSummary);
}

export function popularPopupsQueryOptions() {
	return queryOptions({
		queryKey: ["recommendations", "popular"],
		queryFn: async ({ signal }) => {
			const popups = await getPopups(POPULAR_LIMIT, signal);
			return popups.map((popup) => ({ popup, highlight: null, reviewSummary: null }));
		}
	});
}

/** 추천 API가 없어 SPEC의 취향 없는 회원 규칙대로 목록 한 페이지에서 무작위 셋을 고른다 */
export function homePickQueryOptions() {
	return queryOptions({
		queryKey: ["recommendations", "home"],
		queryFn: async ({ signal }) => {
			const popups = await getPopups(PICK_POOL_LIMIT, signal);

			return pickRandomPopups(popups, PICK_COUNT).map((popup) => ({
				popup,
				reason: null,
				badge: null
			}));
		},
		staleTime: PICK_STALE_TIME_MS
	});
}
