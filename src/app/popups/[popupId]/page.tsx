import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

import { AuthStatusSwitch } from "@/features/auth/components/AuthStatusSwitch";
import { BookmarkSlotProvider } from "@/features/bookmark/components/BookmarkSlotProvider";
import { findPopupDetail } from "@/features/popup/api/get-popup-detail";
import { PopupDetailView } from "@/features/popup/components/PopupDetailView";
import { parsePopupId } from "@/features/popup/model/popup-id";
import { PageHeader } from "@/shared/components/PageHeader";

const HOME_PATH = "/";

const findPopupDetailOrNotFound = cache(async (rawPopupId: string) => {
	const popupId = parsePopupId(rawPopupId);
	const detail = popupId === null ? null : await findPopupDetail(popupId);

	if (detail === null) {
		notFound();
	}

	return detail;
});

export async function generateMetadata({ params }: PageProps<"/popups/[popupId]">) {
	const detail = await findPopupDetailOrNotFound((await params).popupId);
	const metadata: Metadata = {
		title: detail.title,
		description: detail.description,
		openGraph: detail.imageUrl === null ? null : { images: detail.imageUrl }
	};

	return metadata;
}

export default async function PopupDetailPage({ params }: PageProps<"/popups/[popupId]">) {
	const detail = await findPopupDetailOrNotFound((await params).popupId);

	const detailView = <PopupDetailView popup={detail} variant="page" />;
	const pendingDetailView = <BookmarkSlotProvider mode="pending">{detailView}</BookmarkSlotProvider>;

	return (
		<main className="flex flex-1 flex-col">
			<PageHeader title={detail.title} fallbackPath={HOME_PATH} />
			<AuthStatusSwitch
				views={{
					authenticated: <BookmarkSlotProvider mode="member">{detailView}</BookmarkSlotProvider>,
					anonymous: <BookmarkSlotProvider mode="guest">{detailView}</BookmarkSlotProvider>,
					restoring: pendingDetailView,
					unavailable: pendingDetailView
				}}
			/>
		</main>
	);
}
