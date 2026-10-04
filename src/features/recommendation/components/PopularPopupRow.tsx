import Link from "next/link";

import { PopupImage } from "@/shared/components/PopupImage";
import { type PopupSummary, RESERVATION_SHORT_LABELS } from "@/shared/model/popup";
import { buildPopupDetailPath } from "@/shared/model/popup-path";

interface PopularPopupRowProps {
	popup: PopupSummary;
}

export function PopularPopupRow({ popup }: PopularPopupRowProps) {
	return (
		<Link
			href={buildPopupDetailPath(popup.id)}
			className="flex items-center gap-3 rounded-lg focus-ring transition-opacity hover:opacity-80"
		>
			<PopupImage
				src={popup.imageUrl}
				alt=""
				category={popup.category}
				sizes="72px"
				className="size-18 shrink-0 rounded-lg"
			/>
			<div className="flex min-w-0 flex-1 flex-col gap-0.75">
				<div className="flex flex-col gap-0.5">
					<p className="truncate text-b1-16 text-text-1">{popup.title}</p>
					{popup.areaName !== null && <p className="truncate text-b3-14 text-text-1">{popup.areaName}</p>}
				</div>
				{popup.reservationType !== "UNKNOWN" && (
					<p className="truncate text-b3-12 text-text-4">{RESERVATION_SHORT_LABELS[popup.reservationType]}</p>
				)}
			</div>
		</Link>
	);
}
