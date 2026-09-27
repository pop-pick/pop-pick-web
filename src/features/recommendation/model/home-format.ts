import { DEFAULT_NICKNAME, parsePopupDate } from "@/shared/model/popup-format";

const MONTH_DAY_FORMAT = "MM.DD";

export function formatPopupPeriod(startDate: string | null, endDate: string | null) {
	if (startDate === null && endDate === null) {
		return null;
	}

	const start = startDate === null ? "" : parsePopupDate(startDate).format(MONTH_DAY_FORMAT);
	const end = endDate === null ? "" : parsePopupDate(endDate).format(MONTH_DAY_FORMAT);

	return `${start} ~ ${end}`.trim();
}

export function formatPickTitle(nickname: string | null) {
	return `${nickname ?? DEFAULT_NICKNAME}님의 팝업 PICK`;
}
