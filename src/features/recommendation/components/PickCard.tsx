import Link from "next/link";

import ChevronDownIcon from "@/shared/assets/icons/chevron-down.svg";
import ChevronUpIcon from "@/shared/assets/icons/chevron-up.svg";
import { PopupImage } from "@/shared/components/PopupImage";
import { POPUP_CATEGORY_LABELS } from "@/shared/model/popup";
import { buildPopupDetailPath } from "@/shared/model/popup-path";
import { SvgIcon } from "@/shared/ui/SvgIcon";

import { formatPopupPeriod } from "../model/home-format";
import type { RecommendedPopupItem } from "../model/recommended-popup";
import { ImageOverlayBadge } from "./ImageOverlayBadge";

interface PickCardProps {
	recommendation: RecommendedPopupItem;
	isExpanded: boolean;
	imageLoading?: "eager" | "lazy";
	onToggle: () => void;
}

export function PickCard({ recommendation, isExpanded, imageLoading, onToggle }: PickCardProps) {
	const { popup, reason } = recommendation;
	const period = formatPopupPeriod(popup.startDate, popup.endDate);
	const detailsId = `pick-card-${String(popup.id)}-details`;

	return (
		<article className="relative isolate flex h-88.25 w-64.75 flex-col justify-end overflow-hidden rounded-lg p-4">
			<PopupImage
				src={popup.imageUrl}
				alt=""
				category={popup.category}
				sizes="259px"
				loading={imageLoading}
				className="absolute inset-0 -z-10"
				fallbackClassName="items-start pt-24"
			/>
			<div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-b from-transparent from-25% to-black/60 to-75%" />
			<div className="absolute inset-x-4 top-4 flex items-start justify-between gap-2">
				{popup.category !== null && <ImageOverlayBadge label={POPUP_CATEGORY_LABELS[popup.category]} />}
				{popup.areaName !== null && (
					<div className="ml-auto">
						<ImageOverlayBadge label={popup.areaName} />
					</div>
				)}
			</div>
			<div className="flex flex-col gap-2">
				<div className="flex flex-col gap-1">
					<div className="flex items-center justify-between gap-5.5">
						<h3 className="min-w-0 truncate text-b1-16 text-text-w text-shadow-on-image">
							<Link
								href={buildPopupDetailPath(popup.id)}
								className="before:absolute before:inset-0 before:-z-10 before:bg-black/10 before:opacity-0 before:transition-opacity after:absolute after:inset-0 after:rounded-lg hover:before:opacity-100 focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-primary"
							>
								{popup.title}
							</Link>
						</h3>
						{reason !== null && (
							<button
								type="button"
								aria-expanded={isExpanded}
								aria-controls={detailsId}
								aria-label={`${popup.title} 추천 이유`}
								onClick={onToggle}
								className="relative z-10 shrink-0 rounded-sm text-icon-w focus-ring transition-opacity hover:opacity-70"
							>
								<SvgIcon icon={isExpanded ? ChevronDownIcon : ChevronUpIcon} size={24} />
							</button>
						)}
					</div>
					{period !== null && <p className="text-b1-14 text-text-w text-shadow-on-image">{period}</p>}
				</div>
				{reason !== null && (
					<p id={detailsId} hidden={!isExpanded} className="line-clamp-2 text-b2-12 text-text-w text-shadow-on-image">
						{reason}
					</p>
				)}
			</div>
		</article>
	);
}
