import { screen, within } from "@testing-library/react";
import { http } from "msw";
import { expect, test } from "vitest";

import { BookmarkSlotProvider } from "@/features/bookmark/components/BookmarkSlotProvider";
import { PopupDetailView } from "@/features/popup/components/PopupDetailView";
import { type PopupDetailResponse, toPopupDetail } from "@/features/popup/model/popup-detail";

import { apiSuccess, server } from "../support/msw";
import { renderWithProviders } from "../support/render";

function buildDetailResponse(overrides: Partial<PopupDetailResponse> = {}) {
	const response: PopupDetailResponse = {
		popupId: 7,
		title: "성수 어글리 토이 팝업",
		description: "가을 시즌 테마 팝업스토어입니다.",
		imageUrls: null,
		interestCategoryId: 3,
		startDate: "2026-10-01",
		endDate: "2026-10-26",
		openingHours: "매일 11:00 ~ 20:00",
		entryFee: 0,
		addressRoad: "서울 성동구 연무장길 15 1층",
		addressJibun: null,
		latitude: 37.54,
		longitude: 127.05,
		reservationType: "BOTH",
		reservationUrl: "https://example.com/reserve",
		wished: false,
		...overrides
	};

	return response;
}

function renderDetail(overrides: Partial<PopupDetailResponse> = {}) {
	const response = buildDetailResponse(overrides);
	server.use(http.get("*/api/v1/popups/7", () => apiSuccess(response)));

	return renderWithProviders(
		<BookmarkSlotProvider mode="guest">
			<PopupDetailView popup={toPopupDetail(response)} variant="page" />
		</BookmarkSlotProvider>
	);
}

test("TC-011 팝업 상세에 팝업명과 기간, 위치, 운영시간, 입장료, 예약 정보가 보인다", () => {
	renderDetail();

	expect(screen.getByRole("heading", { level: 1, name: "성수 어글리 토이 팝업" })).toBeInTheDocument();
	expect(screen.getByText("서울 성동구 연무장길 15 1층")).toBeInTheDocument();
	expect(screen.getByText("2026.10.01 ~ 10.26 (매일 11:00 ~ 20:00)")).toBeInTheDocument();
	expect(screen.getByText("무료 입장")).toBeInTheDocument();
	expect(screen.getByText("사전 예약 및 현장 대기 가능")).toBeInTheDocument();
	expect(screen.getByRole("link", { name: /예약 사이트로 이동/ })).toHaveAttribute(
		"href",
		"https://example.com/reserve"
	);
	expect(screen.getByRole("heading", { name: "신뢰도 안내" })).toBeInTheDocument();
});

test("TC-011 값이 없는 정보 줄과 예약 사이트 버튼은 그리지 않는다", () => {
	renderDetail({
		description: null,
		startDate: null,
		endDate: null,
		entryFee: null,
		addressRoad: null,
		reservationType: "UNKNOWN",
		reservationUrl: null
	});

	expect(screen.queryByRole("term")).not.toBeInTheDocument();
	expect(screen.queryByText(/예약 사이트로 이동/)).not.toBeInTheDocument();
	expect(within(document.body).getByRole("button", { name: "공유하기" })).toBeInTheDocument();
});
