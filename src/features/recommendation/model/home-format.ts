import { format } from "date-fns";

import { parseDateOnlyOrThrow } from "@/shared/lib/date";
import { DEFAULT_NICKNAME } from "@/shared/model/popup-format";

const MONTH_DAY_FORMAT = "MM.dd";

export function formatPopupPeriod(startDate: string | null, endDate: string | null) {
	if (startDate === null && endDate === null) {
		return null;
	}

	const start = startDate === null ? "" : format(parseDateOnlyOrThrow(startDate), MONTH_DAY_FORMAT);
	const end = endDate === null ? "" : format(parseDateOnlyOrThrow(endDate), MONTH_DAY_FORMAT);

	return `${start} ~ ${end}`.trim();
}

export function formatPickTitle(nickname: string | null) {
	return `${nickname ?? DEFAULT_NICKNAME}님의 팝업 PICK`;
}
