import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { makeQueryClient } from "@/shared/providers/query-client";

import { popularPopupsQueryOptions } from "../api/get-popular-popups";
import { PopularSection } from "./PopularSection";

/** `prefetchQuery`는 실패해도 예외를 내지 않고 실패한 쿼리는 dehydrate에 실리지 않아 브라우저 쿼리가 다시 받는다 */
export async function HomePopularSection() {
	const queryClient = makeQueryClient();
	const options = popularPopupsQueryOptions();
	await queryClient.prefetchQuery(options);

	const error = queryClient.getQueryState(options.queryKey)?.error;
	if (error) {
		console.warn("[recommendation] 서버에서 인기 팝업을 받지 못했다", error);
	}

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<PopularSection />
		</HydrationBoundary>
	);
}
