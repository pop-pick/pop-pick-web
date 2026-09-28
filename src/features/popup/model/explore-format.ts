import { format } from "date-fns";

import { parseDateOnlyOrThrow } from "@/shared/lib/date";
import type { KnownPopupReservationType } from "@/shared/model/popup";
import { REGION_LABELS } from "@/shared/model/region";

import type { ExplorePopup } from "./explore-popup";

const MONTH_DAY_FORMAT = "MM.dd";
const ALWAYS_OPEN_LABEL = "상시운영";

const EXPLORE_RESERVATION_LABELS: Record<KnownPopupReservationType, string> = {
	NONE: "예약 불필요",
	RESERVATION: "예약 필요",
	WAITING: "현장 대기",
	BOTH: "예약 및 현장 대기"
};

function formatEndLabel(endDate: string | null) {
	return endDate === null ? ALWAYS_OPEN_LABEL : `${format(parseDateOnlyOrThrow(endDate), MONTH_DAY_FORMAT)} 종료`;
}

function formatReservationLabel(popup: ExplorePopup) {
	return popup.reservationType === "UNKNOWN" ? null : EXPLORE_RESERVATION_LABELS[popup.reservationType];
}

export function buildMapCardMetaParts(popup: ExplorePopup) {
	return [formatEndLabel(popup.endDate), formatReservationLabel(popup)].filter((part) => part !== null);
}

export function buildListItemMetaParts(popup: ExplorePopup) {
	const region = popup.region === null ? null : REGION_LABELS[popup.region];
	return [region, ...buildMapCardMetaParts(popup)].filter((part) => part !== null);
}
