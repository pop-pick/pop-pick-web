import { notFound } from "next/navigation";
import { cache } from "react";

import { parsePopupId } from "../model/popup-id";
import { findPopupDetail } from "./get-popup-detail";

export const findPopupDetailOrNotFound = cache(async (rawPopupId: string) => {
	const popupId = parsePopupId(rawPopupId);
	const detail = popupId === null ? null : await findPopupDetail(popupId);

	if (detail === null) {
		notFound();
	}

	return detail;
});
