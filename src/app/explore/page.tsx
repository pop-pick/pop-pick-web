import { Suspense } from "react";

import { ExploreView } from "@/features/popup/ui/ExploreView";
import { PLACEHOLDER_POPUPS } from "@/shared/lib/placeholder-data";
import { Skeleton } from "@/shared/ui/Skeleton";

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
