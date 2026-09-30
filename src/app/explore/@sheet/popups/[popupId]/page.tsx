import { notFound } from "next/navigation";

import { AuthStatusSwitch } from "@/features/auth/components/AuthStatusSwitch";
import { readRefreshToken } from "@/features/auth/model/session-cookie";
import { BookmarkSlotProvider } from "@/features/bookmark/components/BookmarkSlotProvider";
import { MatchRateNote } from "@/features/popup/components/MatchRateNote";
import { PopupDetailView } from "@/features/popup/components/PopupDetailView";
import { PopupSheet } from "@/features/popup/components/PopupSheet";
import { buildExploreSheetPath } from "@/features/popup/model/explore-sheet-path";
import { findPlaceholderPopupDetail } from "@/features/popup/model/placeholder-details";
import { parsePopupId } from "@/features/popup/model/popup-id";
import { PLACEHOLDER_NICKNAME } from "@/shared/lib/placeholder-data";
import { buildLoginPath } from "@/shared/model/login-path";

const SHEET_TITLE_ID = "popup-sheet-title";

async function findPopupDetailOrNotFound(params: PageProps<"/explore/popups/[popupId]">["params"]) {
	const popupId = parsePopupId((await params).popupId);
	const detail = popupId === null ? undefined : findPlaceholderPopupDetail(popupId);

	if (!detail) {
		notFound();
	}

	return detail;
}

export async function generateMetadata({ params }: PageProps<"/explore/popups/[popupId]">) {
	const detail = await findPopupDetailOrNotFound(params);
	return { title: detail.title, description: detail.description };
}

export default async function PopupSheetPage({ params }: PageProps<"/explore/popups/[popupId]">) {
	const detail = await findPopupDetailOrNotFound(params);
	const hasSessionCookie = (await readRefreshToken()) !== null;

	const matchRateNote =
		detail.matchRate === null ? null : <MatchRateNote nickname={PLACEHOLDER_NICKNAME} matchRate={detail.matchRate} />;
	const restoringMatchRateNote =
		hasSessionCookie && matchRateNote !== null ? (
			<div aria-hidden className="invisible">
				{matchRateNote}
			</div>
		) : null;
	const detailView = (
		<PopupDetailView
			popup={detail}
			titleId={SHEET_TITLE_ID}
			matchRateSlot={<AuthStatusSwitch views={{ authenticated: matchRateNote, restoring: restoringMatchRateNote }} />}
		/>
	);
	const pendingDetailView = <BookmarkSlotProvider mode="pending">{detailView}</BookmarkSlotProvider>;

	return (
		<PopupSheet labelledBy={SHEET_TITLE_ID}>
			<AuthStatusSwitch
				views={{
					authenticated: <BookmarkSlotProvider mode="member">{detailView}</BookmarkSlotProvider>,
					anonymous: (
						<BookmarkSlotProvider mode="guest" loginHref={buildLoginPath(buildExploreSheetPath(detail.id))}>
							{detailView}
						</BookmarkSlotProvider>
					),
					restoring: pendingDetailView,
					unavailable: pendingDetailView
				}}
			/>
		</PopupSheet>
	);
}
