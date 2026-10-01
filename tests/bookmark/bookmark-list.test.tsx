import { screen, waitFor, within } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { expect, test } from "vitest";

import MyPage from "@/app/my/page";

import { signInAsMember } from "../support/auth";
import { apiSuccess, server } from "../support/msw";
import { renderWithProviders } from "../support/render";

function buildWish(popupId: number, title: string, ended: boolean) {
	return {
		popupId,
		imageUrl: null,
		interestCategoryId: null,
		title,
		startDate: "2026-09-01",
		endDate: ended ? "2026-09-10" : null,
		reservationType: "UNKNOWN",
		ended,
		wishedAt: "2026-09-05T10:00:00+09:00"
	};
}

function serveWishes(readWishes: () => ReturnType<typeof buildWish>[]) {
	server.use(http.get("/api/v1/wishes", () => apiSuccess({ content: readWishes(), hasNext: false, nextCursor: null })));
}

function renderMyPage() {
	signInAsMember();

	return renderWithProviders(<MyPage />, { url: "/my" });
}

test("찜 목록에서 끝난 팝업에는 종료 배지가 붙고 진행 중인 팝업에는 붙지 않는다", async () => {
	serveWishes(() => [buildWish(1, "진행 중 팝업", false), buildWish(2, "지난 팝업", true)]);
	renderMyPage();

	expect(
		within(await screen.findByRole("article", { name: "지난 팝업" })).getByText("종료된 팝업")
	).toBeInTheDocument();
	expect(
		within(screen.getByRole("article", { name: "진행 중 팝업" })).queryByText("종료된 팝업")
	).not.toBeInTheDocument();
});

test("찜한 팝업이 없으면 목록 대신 팝업 둘러보기 안내를 보인다", async () => {
	serveWishes(() => []);
	renderMyPage();

	expect(await screen.findByRole("link", { name: /팝업 둘러보러 가기/ })).toBeInTheDocument();
	expect(screen.queryByRole("list", { name: "찜한 팝업" })).not.toBeInTheDocument();
});

test("찜 목록에서 하트로 해제하면 그 팝업이 목록에서 빠진다", async () => {
	let wishes = [buildWish(1, "남길 팝업", false), buildWish(2, "해제할 팝업", false)];
	serveWishes(() => wishes);
	server.use(
		http.delete("/api/v1/popups/2/wish", () => {
			wishes = wishes.filter((wish) => wish.popupId !== 2);
			return new HttpResponse(null, { status: 204 });
		})
	);
	const { user } = renderMyPage();

	const heart = await screen.findByRole("button", { name: "해제할 팝업 찜" });

	expect(heart).toHaveAttribute("aria-pressed", "true");

	await user.click(heart);
	await user.click(within(await screen.findByRole("alertdialog")).getByRole("button", { name: "해제" }));

	await waitFor(() => {
		expect(screen.queryByRole("article", { name: "해제할 팝업" })).not.toBeInTheDocument();
	});
	expect(screen.getByRole("article", { name: "남길 팝업" })).toBeInTheDocument();
});
