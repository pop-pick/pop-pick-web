import { QueryClient } from "@tanstack/react-query";
import { expect, test } from "vitest";

import { patchBookmarkInCaches } from "@/features/bookmark/model/patch-bookmark-in-caches";

function buildPopup(id: number) {
	return { id, title: `팝업 ${String(id)}`, isBookmarked: false };
}

test("찜 무한 쿼리의 뒤 페이지와 추천 배열에서 같은 id만 바꾸고 팝업 캐시가 아닌 키는 건드리지 않는다", () => {
	const queryClient = new QueryClient();
	queryClient.setQueryData(["bookmarks", "list"], {
		pages: [{ content: [buildPopup(1)] }, { content: [buildPopup(7)] }],
		pageParams: [null, "1"]
	});
	queryClient.setQueryData(["recommendations", "pick"], [buildPopup(7), buildPopup(2)]);
	queryClient.setQueryData(["course", "detail", 7], buildPopup(7));

	patchBookmarkInCaches(queryClient, 7, true);

	expect(queryClient.getQueryData(["bookmarks", "list"])).toEqual({
		pages: [{ content: [buildPopup(1)] }, { content: [{ ...buildPopup(7), isBookmarked: true }] }],
		pageParams: [null, "1"]
	});
	expect(queryClient.getQueryData(["recommendations", "pick"])).toEqual([
		{ ...buildPopup(7), isBookmarked: true },
		buildPopup(2)
	]);
	expect(queryClient.getQueryData(["course", "detail", 7])).toEqual(buildPopup(7));
});
