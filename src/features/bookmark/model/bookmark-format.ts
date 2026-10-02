import { differenceInCalendarDays } from "date-fns";

import { parseDateOnlyOrThrow } from "@/shared/lib/date";

import type { BookmarkedPopup } from "./bookmark";

const ENDING_SOON_DAYS = 7;

export function formatBookmarkBadge(popup: Pick<BookmarkedPopup, "endDate" | "isEnded">, now: Date) {
	if (popup.isEnded) {
		return "종료된 팝업";
	}

	if (popup.endDate === null) {
		return null;
	}

	const daysLeft = differenceInCalendarDays(parseDateOnlyOrThrow(popup.endDate), now);

	if (daysLeft < 0 || daysLeft > ENDING_SOON_DAYS) {
		return null;
	}

	return daysLeft === 0 ? "종료임박 D-Day" : `종료임박 D-${String(daysLeft)}`;
}
