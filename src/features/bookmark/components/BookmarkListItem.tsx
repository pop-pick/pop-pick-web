import { PopupListCard } from "@/shared/components/PopupListCard";
import { formatEndDateLabel } from "@/shared/model/popup-format";
import { Badge } from "@/shared/ui/Badge";

import type { BookmarkedPopup } from "../model/bookmark";
import { formatBookmarkBadge } from "../model/bookmark-format";

interface BookmarkListItemProps {
	popup: BookmarkedPopup;
	now: Date;
}

export function BookmarkListItem({ popup, now }: BookmarkListItemProps) {
	const badgeLabel = formatBookmarkBadge(popup, now);
	const badge = badgeLabel === null ? null : <Badge tone={popup.isEnded ? "neutral" : "primary"}>{badgeLabel}</Badge>;

	return (
		<PopupListCard
			popup={popup}
			isBookmarked={popup.isBookmarked}
			badge={badge}
			meta={formatEndDateLabel(popup.endDate)}
			isDimmed={popup.isEnded}
		/>
	);
}
