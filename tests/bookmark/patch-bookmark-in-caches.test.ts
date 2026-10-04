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

test("popups 아래의 목록과 상세 사본은 바꾸고 찜 여부가 없는 지도 항목과 알 수 없음(null)인 항목은 그대로 둔다", () => {
	const queryClient = new QueryClient();
	const mapPin = { id: 7, title: "지도 핀" };
	const unknownPopup = { id: 7, title: "여부 모름", isBookmarked: null };
	queryClient.setQueryData(["popups", "list", { keyword: "" }], {
		pages: [{ content: [buildPopup(7)] }],
		pageParams: [null]
	});
	queryClient.setQueryData(["popups", "detail", 7], buildPopup(7));
	queryClient.setQueryData(["popups", "map", { swLat: 37.4 }], [mapPin]);
	queryClient.setQueryData(["popups", "unknown"], [unknownPopup]);

	patchBookmarkInCaches(queryClient, 7, true);

	expect(queryClient.getQueryData(["popups", "list", { keyword: "" }])).toEqual({
		pages: [{ content: [{ ...buildPopup(7), isBookmarked: true }] }],
		pageParams: [null]
	});
	expect(queryClient.getQueryData(["popups", "detail", 7])).toEqual({ ...buildPopup(7), isBookmarked: true });
	expect(queryClient.getQueryData(["popups", "map", { swLat: 37.4 }])).toEqual([mapPin]);
	expect(queryClient.getQueryData(["popups", "unknown"])).toEqual([unknownPopup]);
});
