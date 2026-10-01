import type { Metadata } from "next";
import { Suspense } from "react";

import { LogoutMenuItem } from "@/features/auth/components/LogoutMenuItem";
import { RequireAuth } from "@/features/auth/components/RequireAuth";
import { BookmarkListPreparing } from "@/features/bookmark/components/BookmarkListPreparing";
import { BookmarkSlotProvider } from "@/features/bookmark/components/BookmarkSlotProvider";
import { RecentPopupList } from "@/features/popup/components/RecentPopupList";
import { MyPageMenu } from "@/shared/components/MyPageMenu";
import { MyPageSkeleton } from "@/shared/components/MyPageSkeleton";
import { MyPageTabs } from "@/shared/components/MyPageTabs";
import { MY_PAGE_PATH } from "@/shared/model/my-page-tab";

export const metadata: Metadata = {
	title: "마이페이지"
};

export default function MyPage() {
	return (
		<main className="flex flex-1 flex-col pt-6">
			<h1 className="sr-only">마이페이지</h1>
			<RequireAuth nextPath={MY_PAGE_PATH} fallback={<MyPageSkeleton />}>
				<Suspense>
					<BookmarkSlotProvider mode="member">
						<MyPageTabs bookmarkPanel={<BookmarkListPreparing />} recentPanel={<RecentPopupList />} />
					</BookmarkSlotProvider>
				</Suspense>
				<MyPageMenu logoutItem={<LogoutMenuItem />} />
			</RequireAuth>
		</main>
	);
}
