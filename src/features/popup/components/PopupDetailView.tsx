import type { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";
import { POPUP_CATEGORY_LABELS } from "@/shared/model/popup";
import { REGION_LABELS } from "@/shared/model/region";

import { formatViewCount } from "../model/detail-format";
import type { PopupDetail } from "../model/popup-detail";
import { PopupImageCarousel } from "./PopupImageCarousel";
import { PopupInfoCard } from "./PopupInfoCard";
import { ReliabilityNotice } from "./ReliabilityNotice";
import { ReservationLink } from "./ReservationLink";
import { SharePopupButton } from "./SharePopupButton";

interface PopupDetailViewProps {
	popup: PopupDetail;
	bookmarkSlot: ReactNode;
	matchRateSlot: ReactNode;
}

export function PopupDetailView({ popup, bookmarkSlot, matchRateSlot }: PopupDetailViewProps) {
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
											<span className="flex h-6 items-center rounded-lg bg-primary-subtle px-2 text-b2-12 text-primary">
												{POPUP_CATEGORY_LABELS[popup.category]}
											</span>
										)}
										{popup.region !== null && (
											<span className="flex h-6 items-center rounded-lg bg-region-subtle px-2 text-b2-12 text-region">
												{REGION_LABELS[popup.region]}
											</span>
										)}
										{popup.viewCount !== null && (
											<span className="ml-auto text-b3-12 text-text-4">{formatViewCount(popup.viewCount)}</span>
										)}
									</div>
								)}
								<div className="flex flex-col gap-3">
									<h1 className="text-h2 text-text-1">{popup.title}</h1>
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
						{bookmarkSlot}
						<SharePopupButton />
					</div>
				</div>
			</div>
			<ReliabilityNotice />
		</div>
	);
}
