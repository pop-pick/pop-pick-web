import type { ReactNode } from "react";

import { BookmarkSlot } from "@/shared/components/BookmarkSlot";
import { cn } from "@/shared/lib/cn";
import { POPUP_CATEGORY_LABELS } from "@/shared/model/popup";
import { REGION_LABELS } from "@/shared/model/region";

import { formatViewCount } from "../model/detail-format";
import type { PopupDetail } from "../model/popup-detail";
import { buildPopupDetailPath } from "../model/popup-id";
import { PopupImageCarousel } from "./PopupImageCarousel";
import { PopupInfoCard } from "./PopupInfoCard";
import { PopupTagBadge } from "./PopupTagBadge";
import { ReliabilityNotice } from "./ReliabilityNotice";
import { ReservationLink } from "./ReservationLink";
import { SharePopupButton } from "./SharePopupButton";

interface PopupDetailViewProps {
	popup: PopupDetail;
	matchRateSlot: ReactNode;
	titleId?: string;
}

export function PopupDetailView({ popup, matchRateSlot, titleId }: PopupDetailViewProps) {
	const hasBadgeRow = popup.category !== null || popup.region !== null || popup.viewCount !== null;

	return (
		<div className="flex flex-col gap-5 px-5 pt-1.25 pb-10">
			<div className="flex flex-col gap-8">
				<div className="flex flex-col gap-6">
					<div className="flex flex-col gap-5">
						<PopupImageCarousel label={`${popup.title} 사진`} images={popup.imageUrls} category={popup.category} />
						<div className="flex flex-col gap-5">
							<div className="flex flex-col gap-3">
								{hasBadgeRow && (
									<div className="flex items-center gap-1">
										{popup.category !== null && (
											<PopupTagBadge tone="category">{POPUP_CATEGORY_LABELS[popup.category]}</PopupTagBadge>
										)}
										{popup.region !== null && (
											<PopupTagBadge tone="region">{REGION_LABELS[popup.region]}</PopupTagBadge>
										)}
										{popup.viewCount !== null && (
											<span className="ml-auto text-b3-12 text-text-4">{formatViewCount(popup.viewCount)}</span>
										)}
									</div>
								)}
								<div className="flex flex-col gap-3">
									<h1 id={titleId} tabIndex={titleId === undefined ? undefined : -1} className="text-h2 text-text-1">
										{popup.title}
									</h1>
									{popup.description !== null && <p className="text-b3-14 text-text-2">{popup.description}</p>}
								</div>
							</div>
							<PopupInfoCard popup={popup} />
						</div>
					</div>
					{matchRateSlot}
				</div>
				<div className={cn("flex items-center gap-2.5", popup.reservationUrl === null && "justify-end")}>
					{popup.reservationUrl !== null && <ReservationLink href={popup.reservationUrl} />}
					<div className="flex shrink-0 gap-2">
						<BookmarkSlot popupId={popup.id} popupTitle={popup.title} size="lg" />
						<SharePopupButton path={buildPopupDetailPath(popup.id)} />
					</div>
				</div>
			</div>
			<ReliabilityNotice />
		</div>
	);
}
