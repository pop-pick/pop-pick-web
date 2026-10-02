import { queryOptions } from "@tanstack/react-query";

import { getAccessToken } from "@/shared/api/auth-token";
import { api } from "@/shared/api/client";
import { ApiError } from "@/shared/api/errors";

import { type PopupDetailResponse, toPopupDetail } from "../model/popup-detail";

const MISSING_POPUP_ERROR_CODES: readonly string[] = ["E404", "E400"];

interface PopupDetailRequestOptions {
	auth: boolean;
	signal?: AbortSignal;
}

export function getPopupDetail(popupId: number, { auth, signal }: PopupDetailRequestOptions) {
	return api.get<PopupDetailResponse>(`/api/v1/popups/${String(popupId)}`, { auth, signal });
}

export async function findPopupDetail(popupId: number) {
	try {
		return toPopupDetail(await getPopupDetail(popupId, { auth: false }));
	} catch (error) {
		const isMissingPopup =
			error instanceof ApiError && error.errorCode !== null && MISSING_POPUP_ERROR_CODES.includes(error.errorCode);

		if (isMissingPopup) {
			return null;
		}

		throw error;
	}
}

export function popupDetailQueryOptions(popupId: number) {
	return queryOptions({
		queryKey: ["popups", "detail", popupId],
		queryFn: async ({ signal }) =>
			toPopupDetail(await getPopupDetail(popupId, { auth: getAccessToken() !== null, signal }))
	});
}
