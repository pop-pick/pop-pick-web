"use client";

import * as m from "motion/react-m";
import Link from "next/link";

import { BookmarkSlot } from "@/shared/components/BookmarkSlot";
import { PopupImage } from "@/shared/components/PopupImage";
import { POPUP_CATEGORY_LABELS } from "@/shared/model/popup";
import { REGION_LABELS } from "@/shared/model/region";
import { SeparatedText } from "@/shared/ui/SeparatedText";

import { useDragToClose } from "../hooks/useDragToClose";
import { buildMapCardMetaParts } from "../model/explore-format";
import type { ExplorePopup } from "../model/explore-popup";
import { DragHandle } from "./DragHandle";
import { PopupTagBadge } from "./PopupTagBadge";

const SLIDE_FROM = { y: "100%" };
const SLIDE_TO = { y: 0 };

interface MapPopupCardProps {
	popup: ExplorePopup;
	href: string;
	onClose: () => void;
}

export function MapPopupCard({ popup, href, onClose }: MapPopupCardProps) {
	const { offsetY, dragHandleProps } = useDragToClose(onClose);
	const metaParts = buildMapCardMetaParts(popup);
	const hasBadgeRow = popup.category !== null || popup.region !== null;

	return (
		<m.section
			aria-label="선택한 팝업"
			initial={SLIDE_FROM}
			animate={SLIDE_TO}
			style={{ y: offsetY }}
			className="pointer-events-auto rounded-t-3xl bg-bg-1 pb-tab-bar-clearance shadow-sheet"
		>
			<DragHandle dragHandleProps={dragHandleProps} />
			<div className="relative mx-5 mb-6 flex items-center gap-4.5">
				<Link
					href={href}
					className="flex min-w-0 flex-1 items-center gap-3 rounded-lg focus-ring transition-opacity after:absolute after:inset-0 hover:opacity-80"
				>
					<PopupImage
						src={popup.imageUrl}
						alt=""
						category={popup.category}
						sizes="76px"
						className="size-19 shrink-0 rounded-lg"
					/>
					<div className="flex min-w-0 flex-1 flex-col gap-1.5">
						{hasBadgeRow && (
							<div className="flex items-center gap-1">
								{popup.category !== null && (
									<PopupTagBadge tone="category">{POPUP_CATEGORY_LABELS[popup.category]}</PopupTagBadge>
								)}
								{popup.region !== null && <PopupTagBadge tone="region">{REGION_LABELS[popup.region]}</PopupTagBadge>}
							</div>
						)}
						<div className="flex flex-col gap-0.75">
							<p className="truncate text-b1-16 text-text-1">{popup.title}</p>
							{metaParts.length > 0 && (
								<p className="truncate text-b3-12 text-text-4">
									<SeparatedText parts={metaParts} />
								</p>
							)}
						</div>
					</div>
				</Link>
				<div className="relative shrink-0">
					<BookmarkSlot popupId={popup.id} popupTitle={popup.title} size="md" />
				</div>
			</div>
		</m.section>
	);
}
