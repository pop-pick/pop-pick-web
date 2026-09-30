import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthStatusSwitch } from "@/features/auth/components/AuthStatusSwitch";
import { BookmarkSlotProvider } from "@/features/bookmark/components/BookmarkSlotProvider";
import { ExploreView } from "@/features/popup/components/ExploreView";
import { PLACEHOLDER_EXPLORE_POPUPS } from "@/features/popup/model/placeholder-explore";
import { EXPLORE_PATH } from "@/shared/model/explore-state";
import { buildLoginPath } from "@/shared/model/login-path";
import { Skeleton } from "@/shared/ui/Skeleton";

export const metadata: Metadata = {
	title: "탐색"
};

export default function ExplorePage() {
	const exploreView = <ExploreView popups={PLACEHOLDER_EXPLORE_POPUPS} />;
	const pendingView = <BookmarkSlotProvider mode="pending">{exploreView}</BookmarkSlotProvider>;

	return (
		<main className="flex flex-1 flex-col">
			<h1 className="sr-only">탐색</h1>
			<Suspense
				fallback={
					<div role="status" className="flex flex-col gap-4 px-5 pt-17">
						<span className="sr-only">탐색 화면을 준비하고 있습니다</span>
						<Skeleton className="h-10.5 rounded-xl" />
						<Skeleton className="h-12 rounded-xl" />
					</div>
				}
			>
				<AuthStatusSwitch
					views={{
						anonymous: (
							<BookmarkSlotProvider mode="guest" loginHref={buildLoginPath(EXPLORE_PATH)}>
								{exploreView}
							</BookmarkSlotProvider>
						),
						authenticated: <BookmarkSlotProvider mode="member">{exploreView}</BookmarkSlotProvider>,
						restoring: pendingView,
						unavailable: pendingView
					}}
				/>
			</Suspense>
		</main>
	);
}
