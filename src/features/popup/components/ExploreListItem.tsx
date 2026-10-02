import { PopupListCard } from "@/shared/components/PopupListCard";
import { POPUP_CATEGORY_LABELS, type PopupSummary } from "@/shared/model/popup";
import { Badge } from "@/shared/ui/Badge";
import { SeparatedText } from "@/shared/ui/SeparatedText";

import { buildListItemMetaParts } from "../model/explore-format";

interface ExploreListItemProps {
	popup: Omit<PopupSummary, "isBookmarked">;
	isBookmarked: boolean | null;
}

export function ExploreListItem({ popup, isBookmarked }: ExploreListItemProps) {
	const badge = popup.category === null ? null : <Badge>{POPUP_CATEGORY_LABELS[popup.category]}</Badge>;

	return (
		<PopupListCard
			popup={popup}
			isBookmarked={isBookmarked}
			badge={badge}
			meta={<SeparatedText parts={buildListItemMetaParts(popup)} />}
		/>
	);
}
