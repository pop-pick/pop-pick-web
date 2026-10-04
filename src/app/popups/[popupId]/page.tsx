import { AuthStatusSwitch } from "@/features/auth/components/AuthStatusSwitch";
import { BookmarkSlotProvider } from "@/features/bookmark/components/BookmarkSlotProvider";
import { findPopupDetailOrNotFound } from "@/features/popup/api/find-popup-detail-or-not-found";
import { PopupDetailView } from "@/features/popup/components/PopupDetailView";
import { buildPopupMetadata } from "@/features/popup/model/popup-metadata";
import { PageHeader } from "@/shared/components/PageHeader";

const HOME_PATH = "/";

export const revalidate = 300;

/** 빌드 때는 그리지 않고 처음 열릴 때 그려 캐시한다. Next는 빈 배열이어야 런타임 ISR을 켠다 */
export function generateStaticParams() {
	return [];
}

export async function generateMetadata({ params }: PageProps<"/popups/[popupId]">) {
	const detail = await findPopupDetailOrNotFound((await params).popupId);
	return buildPopupMetadata(detail);
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
