import { EmptyState } from "@/shared/components/EmptyState";

import type { ExploreEmptyMessage } from "../model/explore-empty-message";
import type { ExplorePopup } from "../model/explore-popup";
import { ExploreListItem } from "./ExploreListItem";

interface PopupListProps {
	popups: readonly ExplorePopup[];
	emptyMessage: ExploreEmptyMessage;
}

export function PopupList({ popups, emptyMessage }: PopupListProps) {
	if (popups.length === 0) {
		return (
			<div className="flex flex-1 items-center justify-center py-10">
				<EmptyState title={emptyMessage.title} description={emptyMessage.description} hasWarningIcon />
			</div>
		);
	}

	return (
		<ul aria-label="팝업 목록" className="flex flex-col gap-3 pt-4">
			{popups.map((popup) => (
				<li key={popup.id}>
					<ExploreListItem popup={popup} />
				</li>
			))}
		</ul>
	);
}
