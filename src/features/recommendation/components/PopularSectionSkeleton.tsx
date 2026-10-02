import { PopularRowsSkeleton } from "./PopularRowsSkeleton";
import { PopularSectionHeader } from "./PopularSectionHeader";

/** 서버가 인기 팝업을 받는 동안의 자리. 같은 쿼리를 미리 만들면 HydrationBoundary가 서버 렌더에서 데이터를 채우지 않아 쿼리를 부르지 않는다 */
export function PopularSectionSkeleton() {
	return (
		<section aria-labelledby="popular-section-title" className="flex flex-col gap-5">
			<PopularSectionHeader />
			<PopularRowsSkeleton />
		</section>
	);
}
