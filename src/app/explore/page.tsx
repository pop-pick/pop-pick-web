import { Suspense } from "react";

import { ExploreView } from "@/features/popup/ui/ExploreView";
import { PLACEHOLDER_POPUPS } from "@/shared/lib/placeholder-data";
import { Skeleton } from "@/shared/ui/Skeleton";

/**
 * Suspense가 본문 전체를 감싸 정적 HTML에는 제목과 스켈레톤만 남는다. 기본 뷰가 지도라 어차피
 * 스크립트 없이 보여줄 것이 없어 토글만 따로 떼는 이득이 없다고 봤다.
 */
export default function ExplorePage() {
	return (
		<main className="flex flex-1 flex-col">
			<header className="flex flex-col gap-1 px-5 py-4">
				<h1 className="text-2xl font-bold tracking-tight">탐색</h1>
			</header>
			<Suspense
				fallback={
					<div role="status" className="flex flex-1 flex-col gap-3 px-5">
						<span className="sr-only">탐색 화면을 준비하고 있습니다</span>
						<Skeleton className="h-10 w-28 self-end rounded-xl" />
						<Skeleton className="flex-1" />
					</div>
				}
			>
				<ExploreView popups={PLACEHOLDER_POPUPS} />
			</Suspense>
		</main>
	);
}
