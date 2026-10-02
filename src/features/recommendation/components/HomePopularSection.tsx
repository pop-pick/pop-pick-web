import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { makeQueryClient } from "@/shared/providers/query-client";

import { popularPopupsQueryOptions } from "../api/get-popups";
import { PopularSection } from "./PopularSection";

/** 인기 팝업은 공개 데이터라 서버가 받아 첫 HTML에 넣는다. 서버 조회가 실패하면 비운 채 넘기고 브라우저 쿼리가 실패 화면을 그린다 */
export async function HomePopularSection() {
	const queryClient = makeQueryClient();
	await queryClient.prefetchQuery(popularPopupsQueryOptions());

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<PopularSection />
		</HydrationBoundary>
	);
}
