import type { KnownPopupReservationType, PopupSummary } from "@/shared/model/popup";
import { formatEndDateLabel } from "@/shared/model/popup-format";
import { REGION_LABELS } from "@/shared/model/region";

type ExplorePopupMeta = Pick<PopupSummary, "region" | "endDate" | "reservationType">;

const EXPLORE_RESERVATION_LABELS: Record<KnownPopupReservationType, string> = {
	NONE: "예약 불필요",
	RESERVATION: "예약 필요",
	WAITING: "현장 대기",
	BOTH: "예약 및 현장 대기"
};

function formatReservationLabel(popup: ExplorePopupMeta) {
	return popup.reservationType === "UNKNOWN" ? null : EXPLORE_RESERVATION_LABELS[popup.reservationType];
}

export function buildMapCardMetaParts(popup: ExplorePopupMeta) {
	return [formatEndDateLabel(popup.endDate), formatReservationLabel(popup)].filter((part) => part !== null);
}

export function buildListItemMetaParts(popup: ExplorePopupMeta) {
	const region = popup.region === null ? null : REGION_LABELS[popup.region];
	return [region, ...buildMapCardMetaParts(popup)].filter((part) => part !== null);
}
