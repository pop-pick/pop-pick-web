import { type QueryKey, skipToken, useQuery } from "@tanstack/react-query";
import { screen, waitFor, within } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { expect, test, vi } from "vitest";

import { BookmarkSlotProvider } from "@/features/bookmark/components/BookmarkSlotProvider";
import { BookmarkSlot } from "@/shared/components/BookmarkSlot";
import type { PopupSummary } from "@/shared/model/popup";

import { signInAsMember } from "../support/auth";
import { apiError, server } from "../support/msw";
import { renderWithProviders } from "../support/render";

const POPUP_ID = 7;
const LIST_KEY = ["popups", "list", { query: "" }];
const DETAIL_KEY = ["popups", "detail", POPUP_ID];

function buildPopup(isBookmarked: boolean) {
	const popup: PopupSummary = {
		id: POPUP_ID,
		title: "성수 팝업",
		category: null,
		region: null,
		startDate: null,
		endDate: null,
		reservationType: "UNKNOWN",
		imageUrl: null,
		isBookmarked
	};

	return popup;
}

interface ListPage {
	content: PopupSummary[];
}

function selectFromList(data: { pages: ListPage[] }) {
	return data.pages.flatMap((page) => page.content).at(0);
}

function selectDetail(data: PopupSummary) {
	return data;
}

interface CachedHeartProps<T> {
	queryKey: QueryKey;
	select: (data: T) => PopupSummary | undefined;
}

function CachedHeart<T>({ queryKey, select }: CachedHeartProps<T>) {
	const { data: popup } = useQuery({ queryKey, queryFn: skipToken, select });

	if (popup === undefined) {
		return null;
	}

	return <BookmarkSlot popupId={popup.id} popupTitle={popup.title} isBookmarked={popup.isBookmarked} size="sm" />;
}

function renderHearts(mode: "guest" | "member", isBookmarked: boolean) {
	const result = renderWithProviders(
		<BookmarkSlotProvider mode={mode}>
			<section aria-label="목록">
				<CachedHeart queryKey={LIST_KEY} select={selectFromList} />
			</section>
			<section aria-label="상세">
				<CachedHeart queryKey={DETAIL_KEY} select={selectDetail} />
			</section>
		</BookmarkSlotProvider>
	);
	result.queryClient.setQueryData(LIST_KEY, { pages: [{ content: [buildPopup(isBookmarked)] }], pageParams: [null] });
	result.queryClient.setQueryData(DETAIL_KEY, { ...buildPopup(isBookmarked), description: null, tags: [] });

	return result;
}

function findHeart(regionName: string) {
	return within(screen.getByRole("region", { name: regionName })).findByRole("button", { name: "성수 팝업 찜" });
}

async function answerDialog(user: ReturnType<typeof renderHearts>["user"], buttonName: string) {
	await user.click(within(await screen.findByRole("alertdialog")).getByRole("button", { name: buttonName }));
}

test("회원이 찜하지 않은 팝업의 하트를 누르고 취소하면 그대로이고 확인하면 눌린 상태가 된다", async () => {
	signInAsMember();
	server.use(http.put(`/api/v1/popups/${String(POPUP_ID)}/wish`, () => new HttpResponse(null, { status: 204 })));
	const { user } = renderHearts("member", false);
	const heart = await findHeart("상세");

	await user.click(heart);
	await answerDialog(user, "취소");

	expect(heart).toHaveAttribute("aria-pressed", "false");

	await user.click(heart);
	await answerDialog(user, "확인");

	await waitFor(() => {
		expect(heart).toHaveAttribute("aria-pressed", "true");
	});
});

test("찜한 팝업을 해제하면 같은 팝업을 그린 다른 캐시의 하트도 눌리지 않은 상태가 된다", async () => {
	signInAsMember();
	server.use(http.delete(`/api/v1/popups/${String(POPUP_ID)}/wish`, () => new HttpResponse(null, { status: 204 })));
	const { user } = renderHearts("member", true);
	const listHeart = await findHeart("목록");
	const detailHeart = await findHeart("상세");

	await user.click(detailHeart);
	await answerDialog(user, "해제");

	await waitFor(() => {
		expect(listHeart).toHaveAttribute("aria-pressed", "false");
	});
	expect(detailHeart).toHaveAttribute("aria-pressed", "false");
});

test("찜 요청이 실패하면 하트는 그대로이고 실패 알럿이 뜬다", async () => {
	vi.spyOn(console, "error").mockImplementation(() => undefined);
	signInAsMember();
	server.use(http.put(`/api/v1/popups/${String(POPUP_ID)}/wish`, () => apiError(500, "E500")));
	const { user } = renderHearts("member", false);
	const heart = await findHeart("상세");

	await user.click(heart);
	await answerDialog(user, "확인");

	expect(await screen.findByRole("alertdialog", { name: /바꾸지 못했어요/ })).toBeInTheDocument();
	expect(heart).toHaveAttribute("aria-pressed", "false");
});

test("비회원이 하트를 누르고 로그인 하러가기를 누르면 로그인 화면으로 간다", async () => {
	const { user, router } = renderHearts("guest", false);
	const heart = await findHeart("상세");

	await user.click(heart);
	await answerDialog(user, "로그인 하러가기");

	expect(router).toMatchObject({ pathname: "/login" });
});
