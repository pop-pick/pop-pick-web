import { screen } from "@testing-library/react";
import { http } from "msw";
import { expect, test } from "vitest";

import { ExploreView } from "@/features/popup/components/ExploreView";
import type { PageResponse } from "@/shared/api/types";
import { BookmarkSlotContext } from "@/shared/components/BookmarkSlot";
import type { PopupListItemResponse } from "@/shared/model/popup";

import { apiError, apiSuccess, server } from "../support/msw";
import { renderWithProviders } from "../support/render";

const POPUPS_URL = "*/api/v1/popups";

function buildListItem(popupId: number, title: string) {
	const item: PopupListItemResponse = {
		popupId,
		imageUrl: null,
		interestCategoryId: null,
		title,
		endDate: null,
		reservationType: "UNKNOWN",
		wished: false
	};

	return item;
}

function buildPage(items: PopupListItemResponse[], nextCursor: string | null = null) {
	const page: PageResponse<PopupListItemResponse> = { content: items, hasNext: nextCursor !== null, nextCursor };
	return page;
}

function renderExploreList(url: string) {
	const renderNoBookmark = () => null;

	return renderWithProviders(
		<BookmarkSlotContext value={renderNoBookmark}>
			<ExploreView />
		</BookmarkSlotContext>,
		{ url }
	);
}

test("목록 뷰에서 검색어를 넣고 Enter를 누르면 그 검색어로 찾은 팝업만 보인다", async () => {
	server.use(
		http.get(POPUPS_URL, ({ request }) => {
			const keyword = new URL(request.url).searchParams.get("keyword");
			const items = keyword === "성수" ? [buildListItem(1, "성수 캐릭터 팝업")] : [buildListItem(2, "여의도 전시")];

			return apiSuccess(buildPage(items));
		})
	);
	const { user } = renderExploreList("/explore?view=list");

	expect(await screen.findByRole("link", { name: "여의도 전시" })).toBeInTheDocument();

	await user.type(screen.getByRole("searchbox", { name: "팝업 검색" }), "성수{Enter}");

	expect(await screen.findByRole("link", { name: "성수 캐릭터 팝업" })).toBeInTheDocument();
	expect(screen.queryByRole("link", { name: "여의도 전시" })).not.toBeInTheDocument();
});

test("목록 끝에 닿으면 받은 커서로 다음 페이지를 이어 붙인다", async () => {
	server.use(
		http.get(POPUPS_URL, ({ request }) => {
			const cursor = new URL(request.url).searchParams.get("cursor");
			const page =
				cursor === "page-2"
					? buildPage([buildListItem(2, "두 번째 페이지 팝업")])
					: buildPage([buildListItem(1, "첫 페이지 팝업")], "page-2");

			return apiSuccess(page);
		})
	);
	renderExploreList("/explore?view=list");

	expect(await screen.findByRole("link", { name: "두 번째 페이지 팝업" })).toBeInTheDocument();
	expect(screen.getAllByRole("listitem")).toHaveLength(2);
});

test("검색어가 있는데 결과가 비면 검색 결과 없음 화면을 보인다", async () => {
	server.use(http.get(POPUPS_URL, () => apiSuccess(buildPage([]))));
	renderExploreList("/explore?view=list&q=없는팝업");

	expect(await screen.findByText("검색 결과가 없습니다.", { ignore: ".sr-only" })).toBeInTheDocument();
});

test("검색어 없이 결과가 비면 등록된 팝업 없음 화면을 보인다", async () => {
	server.use(http.get(POPUPS_URL, () => apiSuccess(buildPage([]))));
	renderExploreList("/explore?view=list");

	expect(await screen.findByText("아직 등록된 팝업이 없어요.", { ignore: ".sr-only" })).toBeInTheDocument();
});

test("목록을 불러오지 못하면 결과 없음과 다른 실패 화면을 보이고 다시 시도하면 목록이 나온다", async () => {
	server.use(
		http.get(POPUPS_URL, () => apiError(500, "E500"), { once: true }),
		http.get(POPUPS_URL, () => apiSuccess(buildPage([buildListItem(1, "성수 캐릭터 팝업")])))
	);
	const { user } = renderExploreList("/explore?view=list");

	await user.click(await screen.findByRole("button", { name: "다시 시도" }));

	expect(await screen.findByRole("link", { name: "성수 캐릭터 팝업" })).toBeInTheDocument();
});
