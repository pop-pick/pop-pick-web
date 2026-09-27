import { dayjs } from "@/shared/lib/dayjs";

export const DEFAULT_NICKNAME = "회원";

const POPUP_DATE_FORMAT = "YYYY-MM-DD";

export function parsePopupDate(date: string) {
	const parsed = dayjs(date, POPUP_DATE_FORMAT, true);

	if (!parsed.isValid()) {
		throw new Error(`[popup] yyyy-MM-dd 형식이 아닌 날짜다: ${date}`);
	}

	return parsed;
}

export function formatMatchRateMessage(nickname: string | null, matchRate: number) {
	return `${nickname ?? DEFAULT_NICKNAME}님의 취향과 ${String(matchRate)}% 일치해요!`;
}
