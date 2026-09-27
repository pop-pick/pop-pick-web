import { parsePopupDate } from "@/shared/model/popup-format";

const TEN_THOUSAND = 10000;
const FULL_DATE_FORMAT = "YYYY.MM.DD";
const MONTH_DAY_FORMAT = "MM.DD";

function formatDetailDateRange(startDate: string | null, endDate: string | null) {
	if (startDate === null) {
		return endDate === null ? null : `~ ${parsePopupDate(endDate).format(FULL_DATE_FORMAT)}`;
	}

	const start = parsePopupDate(startDate);

	if (endDate === null) {
		return `${start.format(FULL_DATE_FORMAT)} ~`;
	}

	const end = parsePopupDate(endDate);
	const formattedEnd = end.format(start.isSame(end, "year") ? MONTH_DAY_FORMAT : FULL_DATE_FORMAT);

	return `${start.format(FULL_DATE_FORMAT)} ~ ${formattedEnd}`;
}

export function formatDetailPeriod(startDate: string | null, endDate: string | null, openingHours: string | null) {
	const dateRange = formatDetailDateRange(startDate, endDate);

	if (dateRange === null) {
		return null;
	}

	return openingHours === null ? dateRange : `${dateRange} (${openingHours})`;
}

export function formatViewCount(viewCount: number) {
	if (viewCount < TEN_THOUSAND) {
		return `조회수 ${viewCount.toLocaleString("ko-KR")}`;
	}

	const tenThousands = Math.floor((viewCount / TEN_THOUSAND) * 10) / 10;

	return `조회수 ${String(tenThousands)}만`;
}

export function formatEntryFee(entryFee: number | null) {
	if (entryFee === null) {
		return null;
	}

	return entryFee === 0 ? "무료 입장" : `입장료 ${entryFee.toLocaleString("ko-KR")}원`;
}
