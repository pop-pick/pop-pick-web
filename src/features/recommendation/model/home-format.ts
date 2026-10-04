import { format } from "date-fns";

import { parseDateOnlyOrThrow } from "@/shared/lib/date";

const MONTH_DAY_FORMAT = "MM.dd";
export const PICK_TITLE = "회원님의 팝업 PICK";

export function formatPopupPeriod(startDate: string | null, endDate: string | null) {
	if (startDate === null && endDate === null) {
		return null;
	}

	const start = startDate === null ? "" : format(parseDateOnlyOrThrow(startDate), MONTH_DAY_FORMAT);
	const end = endDate === null ? "" : format(parseDateOnlyOrThrow(endDate), MONTH_DAY_FORMAT);

	return `${start} ~ ${end}`.trim();
}
