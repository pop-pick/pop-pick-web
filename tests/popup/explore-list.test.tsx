import { screen, within } from "@testing-library/react";
import { http } from "msw";
import { expect, test, vi } from "vitest";

import { ExploreView } from "@/features/popup/components/ExploreView";
import type { PageResponse } from "@/shared/api/types";
import { BookmarkSlotContext } from "@/shared/components/BookmarkSlot";
import type { PopupListItemResponse } from "@/shared/model/popup";

import { apiError, apiSuccess, server } from "../support/msw";
import { renderWithProviders } from "../support/render";

const POPUPS_URL = "*/api/v1/popups";
const AREAS_URL = "*/api/v1/onboardings/favorite-areas";

const AREAS = [
	{ id: 1, area: "성수" },
	{ id: 2, area: "여의도" },
	{ id: 3, area: "홍대" },
	{ id: 4, area: "잠실" },
	{ id: 5, area: "용산" },
	{ id: 6, area: "종로" },
	{ id: 7, area: "강남" }
];

function buildListItem(popupId: number, title: string, areaName: string | null = null) {
	const item: PopupListItemResponse = {
		popupId,
		imageUrl: null,
		interestCategoryId: null,
		areaName,
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

function renderExploreList(url: string, { isAreaListFailing = false } = {}) {
	const renderNoBookmark = () => null;

	server.use(
		...(isAreaListFailing ? [http.get(AREAS_URL, () => apiError(500, "E500"), { once: true })] : []),
		http.get(AREAS_URL, () => apiSuccess(AREAS))
	);

	return renderWithProviders(
		<BookmarkSlotContext value={renderNoBookmark}>
			<ExploreView />
		</BookmarkSlotContext>,
		{ url }
	);
}

test("TC-008 목록 화면에서 검색어를 넣고 Enter를 누르면 그 검색어로 찾은 팝업만 보인다", async () => {
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

test("인기순 다음 페이지에 같은 팝업이 또 오면 먼저 온 것 하나만 그린다", async () => {
	const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
	server.use(
		http.get(POPUPS_URL, ({ request }) => {
			const cursor = new URL(request.url).searchParams.get("cursor");
			const page =
				cursor === "page-2"
					? buildPage([buildListItem(2, "나중에 온 같은 팝업"), buildListItem(3, "둘째 페이지 팝업")])
					: buildPage([buildListItem(1, "첫 팝업"), buildListItem(2, "먼저 온 팝업")], "page-2");

			return apiSuccess(page);
		})
	);
	renderExploreList("/explore?view=list");

	expect(await screen.findByRole("link", { name: "둘째 페이지 팝업" })).toBeInTheDocument();
	expect(screen.getAllByRole("listitem")).toHaveLength(3);
	expect(screen.getByRole("link", { name: "먼저 온 팝업" })).toBeInTheDocument();
	expect(screen.queryByRole("link", { name: "나중에 온 같은 팝업" })).not.toBeInTheDocument();
	expect(consoleError).not.toHaveBeenCalled();
});

test("TC-010 검색어가 있는데 결과가 비면 검색 결과 없음 안내를 보인다", async () => {
	server.use(http.get(POPUPS_URL, () => apiSuccess(buildPage([]))));
	renderExploreList("/explore?view=list&q=없는팝업");

	expect(await screen.findByText("검색 결과가 없습니다.", { ignore: ".sr-only" })).toBeInTheDocument();
	expect(
		screen.getByText(/다른 검색어를 입력하거나\s*지역을 변경해 다시 입력해주세요\./, { ignore: ".sr-only" })
	).toBeInTheDocument();
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

/** 지역과 정렬, 첫 페이지 요청에만 응답한다. 나머지 요청은 빈 목록이라 화면이 그 조건으로 요청했는지를 드러낸다 */
function serveListFor(match: { areaId?: string; sort: string }, items: PopupListItemResponse[]) {
	server.use(
		http.get(POPUPS_URL, ({ request }) => {
			const { searchParams } = new URL(request.url);
			const isMatch =
				searchParams.get("areaId") === (match.areaId ?? null) &&
				searchParams.get("sort") === match.sort &&
				searchParams.get("cursor") === null;

			return apiSuccess(buildPage(isMatch ? items : []));
		})
	);
}

test("TC-009 지역 드롭다운은 전체 지역이 기본이고 백엔드 지역 일곱 곳을 보인다", async () => {
	serveListFor({ sort: "popular" }, [buildListItem(1, "성수 캐릭터 팝업", "성수")]);
	const { user } = renderExploreList("/explore?view=list");

	await user.click(await screen.findByRole("button", { name: "지역 전체 지역" }));

	const options = within(screen.getByRole("listbox")).getAllByRole("option");

	expect(options.map((option) => option.textContent)).toEqual([
		"전체 지역",
		"성수",
		"여의도",
		"홍대",
		"잠실",
		"용산",
		"종로",
		"강남"
	]);
	expect(screen.getByRole("option", { name: "전체 지역" })).toHaveAttribute("aria-selected", "true");
});

test("TC-009 지역을 고르면 주소에 지역이 남고 그 지역의 팝업을 첫 페이지부터 보인다", async () => {
	server.use(
		http.get(POPUPS_URL, ({ request }) => {
			const { searchParams } = new URL(request.url);
			const isHongdaeFirstPage = searchParams.get("areaId") === "3" && searchParams.get("cursor") === null;

			return apiSuccess(
				buildPage(
					isHongdaeFirstPage ? [buildListItem(2, "홍대 전시", "홍대")] : [buildListItem(1, "성수 첫 페이지 팝업")]
				)
			);
		})
	);
	const { user } = renderExploreList("/explore?view=list");

	expect(await screen.findByRole("link", { name: "성수 첫 페이지 팝업" })).toBeInTheDocument();

	await user.click(screen.getByRole("button", { name: "지역 전체 지역" }));
	await user.click(screen.getByRole("option", { name: "홍대" }));

	const card = await screen.findByRole("article", { name: "홍대 전시" });

	expect(within(card).getByText(/^홍대/, { selector: "p" })).toBeInTheDocument();
	expect(screen.queryByRole("link", { name: "성수 첫 페이지 팝업" })).not.toBeInTheDocument();
	expect(screen.getByRole("button", { name: "지역 홍대" })).toBeInTheDocument();
	expect(window.location.search).toBe("?view=list&area=3");
});

test("TC-009 주소의 지역으로 열면 그 지역이 골라진 채 그 지역의 팝업을 보인다", async () => {
	serveListFor({ areaId: "3", sort: "popular" }, [buildListItem(2, "홍대 전시", "홍대")]);
	renderExploreList("/explore?view=list&area=3");

	expect(await screen.findByRole("link", { name: "홍대 전시" })).toBeInTheDocument();
	expect(screen.getByRole("button", { name: "지역 홍대" })).toBeInTheDocument();
});

test("TC-009 고른 지역에 팝업이 없으면 지역 이름을 넣은 결과 없음 화면을 보인다", async () => {
	serveListFor({ areaId: "4", sort: "popular" }, []);
	renderExploreList("/explore?view=list&area=4");

	expect(await screen.findByText("잠실에 등록된 팝업이 없어요.", { ignore: ".sr-only" })).toBeInTheDocument();
	expect(
		screen.getByText(/다른 지역을 선택하여\s*팝업을 다시 찾아보세요\./, { ignore: ".sr-only" })
	).toBeInTheDocument();
});

test("TC-009 지역 목록을 받지 못해도 팝업 목록은 보이고 다시 시도하면 드롭다운이 나온다", async () => {
	vi.spyOn(console, "error").mockImplementation(() => undefined);
	serveListFor({ sort: "popular" }, [buildListItem(1, "성수 캐릭터 팝업")]);
	const { user } = renderExploreList("/explore?view=list", { isAreaListFailing: true });

	expect(await screen.findByRole("link", { name: "성수 캐릭터 팝업" })).toBeInTheDocument();

	await user.click(await screen.findByRole("button", { name: "지역 다시 시도" }));

	expect(await screen.findByRole("button", { name: "지역 전체 지역" })).toBeInTheDocument();
});

test("정렬은 인기순이 기본이고 최신순을 누르면 최신순으로 다시 받는다", async () => {
	server.use(
		http.get(POPUPS_URL, ({ request }) => {
			const sort = new URL(request.url).searchParams.get("sort");

			return apiSuccess(buildPage([buildListItem(1, sort === "latest" ? "방금 연 팝업" : "조회수 많은 팝업")]));
		})
	);
	const { user } = renderExploreList("/explore?view=list");

	expect(await screen.findByRole("link", { name: "조회수 많은 팝업" })).toBeInTheDocument();
	expect(screen.getByRole("button", { name: "인기순" })).toHaveAttribute("aria-pressed", "true");

	await user.click(screen.getByRole("button", { name: "최신순" }));

	expect(await screen.findByRole("link", { name: "방금 연 팝업" })).toBeInTheDocument();
	expect(screen.getByRole("button", { name: "최신순" })).toHaveAttribute("aria-pressed", "true");
	expect(window.location.search).toBe("?view=list&sort=latest");
});
