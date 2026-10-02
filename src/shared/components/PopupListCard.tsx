import Link from "next/link";
import { type ReactElement, type ReactNode, useId } from "react";

import { BookmarkSlot } from "@/shared/components/BookmarkSlot";
import { PopupImage } from "@/shared/components/PopupImage";
import { tv } from "@/shared/lib/tv";
import type { PopupSummary } from "@/shared/model/popup";
import { buildPopupDetailPath } from "@/shared/model/popup-path";

const popupListCardVariants = tv({
	slots: {
		card: "relative flex items-center gap-3 rounded-2xl bg-bg-1 p-3 outline outline-divider-2 transition-colors hover:bg-bg-2",
		heading: "flex min-w-0 flex-col gap-1.5"
	},
	variants: {
		isDimmed: {
			true: { card: "opacity-70" }
		},
		isTitleBesideBookmark: {
			true: { heading: "pr-10" }
		}
	}
});

interface PopupListCardProps {
	popup: Pick<PopupSummary, "id" | "title" | "imageUrl" | "category">;
	isBookmarked: boolean | null;
	badge: ReactElement | null;
	meta: ReactNode;
	isDimmed?: boolean;
}

export function PopupListCard({ popup, isBookmarked, badge, meta, isDimmed = false }: PopupListCardProps) {
	const titleId = useId();
	const styles = popupListCardVariants({ isDimmed, isTitleBesideBookmark: badge === null });

	return (
		<article aria-labelledby={titleId} className={styles.card()}>
			<PopupImage
				src={popup.imageUrl}
				alt=""
				category={popup.category}
				sizes="88px"
				className="size-22 shrink-0 rounded-xl"
			/>
			<div className="flex min-w-0 flex-1 flex-col gap-1 self-stretch py-0.5">
				{badge !== null && <div className="flex h-8 items-center">{badge}</div>}
				<div className={styles.heading()}>
					<h2 id={titleId} className="truncate text-b1-16 text-text-1">
						<Link
							href={buildPopupDetailPath(popup.id)}
							className="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-primary"
						>
							{popup.title}
						</Link>
					</h2>
					<p className="truncate text-b3-12 text-text-4">{meta}</p>
				</div>
			</div>
			<div className="absolute top-3.5 right-3 z-10">
				<BookmarkSlot popupId={popup.id} popupTitle={popup.title} isBookmarked={isBookmarked} size="sm" />
			</div>
		</article>
	);
}
