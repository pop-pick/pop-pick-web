import { format } from "date-fns";

import { parseDateOnlyOrThrow } from "@/shared/lib/date";

export function formatEndDateLabel(endDate: string | null) {
	return endDate === null ? "상시운영" : `${format(parseDateOnlyOrThrow(endDate), "MM.dd")} 종료`;
}
