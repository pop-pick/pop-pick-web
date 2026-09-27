import { notFound } from "next/navigation";

import { AuthStatusSwitch } from "@/features/auth/components/AuthStatusSwitch";
import { buildLoginPath } from "@/features/auth/model/next-path";
import { readRefreshToken } from "@/features/auth/model/session-cookie";
import { BookmarkButton } from "@/features/bookmark/components/BookmarkButton";
import { MatchRateNote } from "@/features/popup/components/MatchRateNote";
import { PopupDetailHeader } from "@/features/popup/components/PopupDetailHeader";
import { PopupDetailView } from "@/features/popup/components/PopupDetailView";
import { findPlaceholderPopupDetail } from "@/features/popup/model/placeholder-details";
import { parsePopupId } from "@/features/popup/model/popup-id";
import { PLACEHOLDER_NICKNAME } from "@/shared/lib/placeholder-data";

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

	const pendingBookmark = <BookmarkButton mode="pending" popupTitle={detail.title} />;
	const matchRateNote =
		detail.matchRate === null ? null : <MatchRateNote nickname={PLACEHOLDER_NICKNAME} matchRate={detail.matchRate} />;
	const restoringMatchRateNote =
		hasSessionCookie && matchRateNote !== null ? (
			<div aria-hidden className="invisible">
				{matchRateNote}
			</div>
		) : null;

	return (
		<main className="flex flex-1 flex-col pb-tab-bar-clearance">
			<PopupDetailHeader title={detail.title} />
			<PopupDetailView
				popup={detail}
				bookmarkSlot={
					<AuthStatusSwitch
						views={{
							authenticated: <BookmarkButton mode="member" popupTitle={detail.title} />,
							anonymous: (
								<BookmarkButton
									mode="guest"
									popupTitle={detail.title}
									loginHref={buildLoginPath(`/popups/${String(detail.id)}`)}
								/>
							),
							restoring: pendingBookmark,
							unavailable: pendingBookmark
						}}
					/>
				}
				matchRateSlot={<AuthStatusSwitch views={{ authenticated: matchRateNote, restoring: restoringMatchRateNote }} />}
			/>
		</main>
	);
}
