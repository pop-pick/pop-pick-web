import { screen, waitFor, within } from "@testing-library/react";
import { http } from "msw";
import { expect, test, vi } from "vitest";

import MyPage from "@/app/my/page";
import type { PopupDetailResponse } from "@/features/popup/model/popup-detail";
import type { RecentPopup } from "@/shared/model/useRecentPopupsStore";

import { signInAsMember } from "../support/auth";
import { apiError, apiSuccess, server } from "../support/msw";
import { renderWithProviders } from "../support/render";

const RECENT_POPUP: RecentPopup = {
	id: 7,
	title: "성수 팝업",
	category: null,
	region: null,
	startDate: null,
	endDate: null,
	reservationType: "UNKNOWN",
	imageUrl: null
};

const DETAIL_RESPONSE: PopupDetailResponse = {
	popupId: 7,
	title: "성수 팝업",
	description: null,
	imageUrls: null,
	interestCategoryId: null,
	startDate: null,
	endDate: null,
	openingHours: null,
	entryFee: null,
	addressRoad: null,
	addressJibun: null,
	latitude: null,
	longitude: null,
	reservationType: "UNKNOWN",
	reservationUrl: null,
	wished: true
};

function saveRecentPopups() {
	sessionStorage.setItem("pp-recent-popups", JSON.stringify({ state: { items: [RECENT_POPUP] }, version: 2 }));
}

test("최근 본 팝업 탭의 하트는 기록이 아니라 상세 조회로 받은 찜 여부를 보인다", async () => {
	saveRecentPopups();
	signInAsMember();
	server.use(http.get("/api/v1/popups/7", () => apiSuccess(DETAIL_RESPONSE)));
	renderWithProviders(<MyPage />, { url: "/my?tab=recent" });

	const recentList = await screen.findByRole("list", { name: "최근 본 팝업" });

	await waitFor(() => {
		expect(within(recentList).getByRole("button", { name: "성수 팝업 찜" })).toHaveAttribute("aria-pressed", "true");
	});
});

test("찜 여부를 받지 못하면 최근 본 팝업의 하트를 찜 안 함으로 그리지 않고 누를 수 없게 둔다", async () => {
	const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
	saveRecentPopups();
	signInAsMember();
	server.use(http.get("/api/v1/popups/7", () => apiError(500, "E500")));
	renderWithProviders(<MyPage />, { url: "/my?tab=recent" });

	await waitFor(() => {
		expect(consoleError).toHaveBeenCalledWith(expect.stringContaining("[popup]"), expect.anything());
	});

	const heart = within(await screen.findByRole("list", { name: "최근 본 팝업" })).getByRole("button", {
		name: "성수 팝업 찜"
	});

	expect(heart).toHaveAttribute("aria-disabled", "true");
	expect(heart).toHaveAttribute("aria-busy", "true");
});
