import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

import { AuthStatusSwitch } from "@/features/auth/components/AuthStatusSwitch";
import { BookmarkSlotProvider } from "@/features/bookmark/components/BookmarkSlotProvider";
import { findPopupDetail } from "@/features/popup/api/get-popup-detail";
import { PopupDetailView } from "@/features/popup/components/PopupDetailView";
import { PopupSheet } from "@/features/popup/components/PopupSheet";
import { parsePopupId } from "@/features/popup/model/popup-id";
import { SITE_OPEN_GRAPH } from "@/shared/model/site-metadata";

const SHEET_TITLE_ID = "popup-sheet-title";

export const revalidate = 300;

/** 빌드 때는 그리지 않고 처음 열릴 때 그려 캐시한다. Next는 빈 배열이어야 런타임 ISR을 켠다 */
export function generateStaticParams() {
	return [];
}

const findPopupDetailOrNotFound = cache(async (rawPopupId: string) => {
	const popupId = parsePopupId(rawPopupId);
	const detail = popupId === null ? null : await findPopupDetail(popupId);

	if (detail === null) {
		notFound();
	}

	return detail;
});

export async function generateMetadata({ params }: PageProps<"/explore/popups/[popupId]">) {
	const detail = await findPopupDetailOrNotFound((await params).popupId);
	const metadata: Metadata = {
		title: detail.title,
		description: detail.description,
		openGraph: {
			...SITE_OPEN_GRAPH,
			title: detail.title,
			description: detail.description ?? SITE_OPEN_GRAPH.description,
			images: detail.imageUrl ?? SITE_OPEN_GRAPH.images
		}
	};

	return metadata;
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
