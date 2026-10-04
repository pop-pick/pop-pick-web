import { PopularRowsSkeleton } from "./PopularRowsSkeleton";
import { PopularSectionHeader } from "./PopularSectionHeader";

/** 여기서 `popularPopupsQueryOptions`로 `useQuery`를 부르면 캐시에 쿼리가 먼저 생겨 `HydrationBoundary`가 서버 렌더에서 데이터를 채우지 않는다 */
export function PopularSectionSkeleton() {
	return (
		<section aria-labelledby="popular-section-title" className="flex flex-col gap-5">
			<PopularSectionHeader />
			<PopularRowsSkeleton />
		</section>
	);
}
