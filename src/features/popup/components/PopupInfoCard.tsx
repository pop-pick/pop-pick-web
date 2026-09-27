import CalendarIcon from "@/shared/assets/icons/calendar.svg";
import ClockIcon from "@/shared/assets/icons/clock.svg";
import MapPinIcon from "@/shared/assets/icons/map-pin.svg";
import TicketIcon from "@/shared/assets/icons/ticket.svg";

import { formatDetailPeriod, formatEntryFee } from "../model/detail-format";
import { type PopupDetail, RESERVATION_DETAIL_LABELS } from "../model/popup-detail";
import { PopupInfoRow } from "./PopupInfoRow";

interface PopupInfoCardProps {
	popup: PopupDetail;
}

export function PopupInfoCard({ popup }: PopupInfoCardProps) {
	const period = formatDetailPeriod(popup.startDate, popup.endDate, popup.openingHours);
	const entryFee = formatEntryFee(popup.entryFee);
	const reservation = popup.reservationType === "UNKNOWN" ? null : RESERVATION_DETAIL_LABELS[popup.reservationType];

	if (popup.addressRoad === null && period === null && entryFee === null && reservation === null) {
		return null;
	}

	return (
		<dl className="flex flex-col gap-3 rounded-2xl border border-divider-2 bg-bg-1 p-4">
			{popup.addressRoad !== null && (
				<PopupInfoRow icon={MapPinIcon} label="주소">
					{popup.addressRoad}
				</PopupInfoRow>
			)}
			{period !== null && (
				<PopupInfoRow icon={ClockIcon} label="운영 기간과 시간">
					{period}
				</PopupInfoRow>
			)}
			{entryFee !== null && (
				<PopupInfoRow icon={TicketIcon} label="입장료">
					{entryFee}
				</PopupInfoRow>
			)}
			{reservation !== null && (
				<PopupInfoRow icon={CalendarIcon} label="입장 방식">
					{reservation}
				</PopupInfoRow>
			)}
		</dl>
	);
}
