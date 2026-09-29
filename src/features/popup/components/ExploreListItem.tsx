import Link from "next/link";

import { BookmarkSlot } from "@/shared/components/BookmarkSlot";
import { PopupImage } from "@/shared/components/PopupImage";
import { POPUP_CATEGORY_LABELS, type PopupSummary } from "@/shared/model/popup";
import { buildPopupDetailPath } from "@/shared/model/popup-path";
import { SeparatedText } from "@/shared/ui/SeparatedText";

import { buildListItemMetaParts } from "../model/explore-format";
import { PopupTagBadge } from "./PopupTagBadge";

interface ExploreListItemProps {
	popup: PopupSummary;
}

export function ExploreListItem({ popup }: ExploreListItemProps) {
	const metaParts = buildListItemMetaParts(popup);

	return (
		<article className="relative flex items-center gap-3 rounded-2xl border border-divider-2 bg-bg-1 p-3 transition-colors hover:bg-bg-2">
			<PopupImage
				src={popup.imageUrl}
				alt=""
				category={popup.category}
				sizes="88px"
				className="size-22 shrink-0 rounded-xl"
			/>
			<div className="flex min-w-0 flex-1 flex-col gap-1">
				<div className="flex h-8 items-center justify-between gap-2">
					{popup.category === null ? (
						<span />
					) : (
						<PopupTagBadge tone="category">{POPUP_CATEGORY_LABELS[popup.category]}</PopupTagBadge>
					)}
					<div className="relative z-10">
						<BookmarkSlot popupId={popup.id} popupTitle={popup.title} size="sm" />
					</div>
				</div>
				<div className="flex flex-col gap-1.5">
					<h2 className="truncate text-b1-16 text-text-1">
						<Link
							href={buildPopupDetailPath(popup.id)}
							className="rounded-sm focus-ring after:absolute after:inset-0 after:rounded-2xl"
						>
							{popup.title}
						</Link>
					</h2>
					{metaParts.length > 0 && (
						<p className="truncate text-b3-12 text-text-4">
							<SeparatedText parts={metaParts} />
						</p>
					)}
				</div>
			</div>
		</article>
	);
}
