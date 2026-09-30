import { notFound } from "next/navigation";

import { AuthStatusSwitch } from "@/features/auth/components/AuthStatusSwitch";
import { readRefreshToken } from "@/features/auth/model/session-cookie";
import { BookmarkSlotProvider } from "@/features/bookmark/components/BookmarkSlotProvider";
import { MatchRateNote } from "@/features/popup/components/MatchRateNote";
import { PopupDetailView } from "@/features/popup/components/PopupDetailView";
import { findPlaceholderPopupDetail } from "@/features/popup/model/placeholder-details";
import { parsePopupId } from "@/features/popup/model/popup-id";
import { PageHeader } from "@/shared/components/PageHeader";
import { PLACEHOLDER_NICKNAME } from "@/shared/lib/placeholder-data";

const HOME_PATH = "/";

async function findPopupDetailOrNotFound(params: PageProps<"/popups/[popupId]">["params"]) {
	const popupId = parsePopupId((await params).popupId);
	const detail = popupId === null ? undefined : findPlaceholderPopupDetail(popupId);

	if (!detail) {
		notFound();
	}

	return detail;
}

export async function generateMetadata({ params }: PageProps<"/popups/[popupId]">) {
	const detail = await findPopupDetailOrNotFound(params);
	return { title: detail.title, description: detail.description };
}

export default async function PopupDetailPage({ params }: PageProps<"/popups/[popupId]">) {
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
			variant="page"
			matchRateSlot={<AuthStatusSwitch views={{ authenticated: matchRateNote, restoring: restoringMatchRateNote }} />}
		/>
	);
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
