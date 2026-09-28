import Link from "next/link";

import { PopupImage } from "@/shared/components/PopupImage";
import { RESERVATION_SHORT_LABELS } from "@/shared/model/popup";
import { buildPopupDetailPath } from "@/shared/model/popup-path";
import { REGION_LABELS } from "@/shared/model/region";
import { SeparatedText } from "@/shared/ui/SeparatedText";

import type { PopularPopupItem } from "../model/home-popup";

function buildLocationParts({ popup, highlight }: PopularPopupItem) {
	const parts = [popup.region === null ? null : REGION_LABELS[popup.region], highlight];
	return parts.filter((part) => part !== null);
}

function buildDetailParts({ popup, reviewSummary }: PopularPopupItem) {
	const review =
		reviewSummary === null ? null : `평점 ${String(reviewSummary.rating)} (리뷰 ${String(reviewSummary.count)}개)`;
	const reservation = popup.reservationType === "UNKNOWN" ? null : RESERVATION_SHORT_LABELS[popup.reservationType];

	return [review, reservation].filter((part) => part !== null);
}

interface PopularPopupRowProps {
	item: PopularPopupItem;
}

export function PopularPopupRow({ item }: PopularPopupRowProps) {
	const locationParts = buildLocationParts(item);
	const detailParts = buildDetailParts(item);

	return (
		<Link
			href={buildPopupDetailPath(item.popup.id)}
			className="flex items-center gap-3 rounded-lg focus-ring transition-opacity hover:opacity-80"
		>
			<PopupImage
				src={item.popup.imageUrl}
				alt=""
				category={item.popup.category}
				sizes="72px"
				className="size-18 shrink-0 rounded-lg"
			/>
			<div className="flex min-w-0 flex-1 flex-col gap-0.75">
				<div className="flex flex-col gap-0.5">
					<p className="truncate text-b1-16 text-text-1">{item.popup.title}</p>
					{locationParts.length > 0 && (
						<p className="truncate text-b3-14 text-text-1">
							<SeparatedText parts={locationParts} />
						</p>
					)}
				</div>
				{detailParts.length > 0 && (
					<p className="truncate text-b3-12 text-text-4">
						<SeparatedText parts={detailParts} />
					</p>
				)}
			</div>
		</Link>
	);
}
