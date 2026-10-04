import { AuthStatusSwitch } from "@/features/auth/components/AuthStatusSwitch";
import { BookmarkSlotProvider } from "@/features/bookmark/components/BookmarkSlotProvider";
import { findPopupDetailOrNotFound } from "@/features/popup/api/find-popup-detail-or-not-found";
import { PopupDetailView } from "@/features/popup/components/PopupDetailView";
import { PopupSheet } from "@/features/popup/components/PopupSheet";
import { buildPopupMetadata } from "@/features/popup/model/popup-metadata";

const SHEET_TITLE_ID = "popup-sheet-title";

export const revalidate = 300;

/** 빌드 때는 그리지 않고 처음 열릴 때 그려 캐시한다. Next는 빈 배열이어야 런타임 ISR을 켠다 */
export function generateStaticParams() {
	return [];
}

export async function generateMetadata({ params }: PageProps<"/explore/popups/[popupId]">) {
	const detail = await findPopupDetailOrNotFound((await params).popupId);
	return buildPopupMetadata(detail);
}

export default async function PopupSheetPage({ params }: PageProps<"/explore/popups/[popupId]">) {
	const detail = await findPopupDetailOrNotFound((await params).popupId);

	const detailView = <PopupDetailView popup={detail} titleId={SHEET_TITLE_ID} variant="sheet" />;
	const pendingDetailView = <BookmarkSlotProvider mode="pending">{detailView}</BookmarkSlotProvider>;

	return (
		<PopupSheet labelledBy={SHEET_TITLE_ID}>
			<AuthStatusSwitch
				views={{
					authenticated: <BookmarkSlotProvider mode="member">{detailView}</BookmarkSlotProvider>,
					anonymous: <BookmarkSlotProvider mode="guest">{detailView}</BookmarkSlotProvider>,
					restoring: pendingDetailView,
					unavailable: pendingDetailView
				}}
			/>
		</PopupSheet>
	);
}
