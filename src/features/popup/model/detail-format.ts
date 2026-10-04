import { format, isSameYear } from "date-fns";

import { parseDateOnlyOrThrow } from "@/shared/lib/date";

const FULL_DATE_FORMAT = "yyyy.MM.dd";
const MONTH_DAY_FORMAT = "MM.dd";

function formatDetailDateRange(startDate: string | null, endDate: string | null) {
	if (startDate === null) {
		return endDate === null ? null : `~ ${format(parseDateOnlyOrThrow(endDate), FULL_DATE_FORMAT)}`;
	}

	const start = parseDateOnlyOrThrow(startDate);

	if (endDate === null) {
		return `${format(start, FULL_DATE_FORMAT)} ~`;
	}

	const end = parseDateOnlyOrThrow(endDate);
	const formattedEnd = format(end, isSameYear(start, end) ? MONTH_DAY_FORMAT : FULL_DATE_FORMAT);

	return `${format(start, FULL_DATE_FORMAT)} ~ ${formattedEnd}`;
}

export function formatDetailPeriod(startDate: string | null, endDate: string | null, openingHours: string | null) {
	const dateRange = formatDetailDateRange(startDate, endDate);

	if (dateRange === null) {
		return null;
	}

	return openingHours === null ? dateRange : `${dateRange} (${openingHours})`;
}

export function formatEntryFee(entryFee: number | null) {
	if (entryFee === null) {
		return null;
	}

	return entryFee === 0 ? "무료 입장" : `입장료 ${entryFee.toLocaleString("ko-KR")}원`;
}

const VIEW_COUNT_UNIT = 10_000;

export function formatViewCount(viewCount: number) {
	if (viewCount < VIEW_COUNT_UNIT) {
		return `조회수 ${viewCount.toLocaleString("ko-KR")}`;
	}

	return `조회수 ${String(Math.floor(viewCount / (VIEW_COUNT_UNIT / 10)) / 10)}만`;
}
