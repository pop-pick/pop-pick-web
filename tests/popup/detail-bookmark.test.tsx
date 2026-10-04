import { screen, waitFor } from "@testing-library/react";
import { http } from "msw";
import { useState } from "react";
import { expect, test, vi } from "vitest";

import { BookmarkSlotProvider } from "@/features/bookmark/components/BookmarkSlotProvider";
import { popupDetailQueryOptions } from "@/features/popup/api/get-popup-detail";
import { PopupDetailBookmark } from "@/features/popup/components/PopupDetailBookmark";
import { type PopupDetailResponse, toPopupDetail } from "@/features/popup/model/popup-detail";

import { signInAsMember } from "../support/auth";
import { apiError, server } from "../support/msw";
import { renderWithProviders } from "../support/render";

const POPUP_ID = 7;
const HEART_NAME = "성수 팝업 찜";

function buildDetailResponse(wished: boolean) {
	const response: PopupDetailResponse = {
		popupId: POPUP_ID,
		title: "성수 팝업",
		description: null,
		imageUrls: null,
		interestCategoryId: null,
		areaName: null,
		startDate: null,
		endDate: null,
		openingHours: null,
		entryFee: null,
		addressRoad: null,
		addressJibun: null,
		latitude: 37.5445,
		longitude: 127.0557,
		reservationType: "UNKNOWN",
		reservationUrl: null,
		wished
	};

	return response;
}

function renderDetailBookmark() {
	const serverDetail = toPopupDetail(buildDetailResponse(false));

	return renderWithProviders(
		<BookmarkSlotProvider mode="member">
			<PopupDetailBookmark initialDetail={serverDetail} />
		</BookmarkSlotProvider>
	);
}

const APP_STALE_TIME_MS = 30_000;

function DetailSheetOpener() {
	const [isOpen, setIsOpen] = useState(false);

	const handleOpen = () => {
		setIsOpen(true);
	};

	if (!isOpen) {
		return (
			<button type="button" onClick={handleOpen}>
				시트 열기
			</button>
		);
	}

	return (
		<BookmarkSlotProvider mode="member">
			<PopupDetailBookmark initialDetail={toPopupDetail(buildDetailResponse(false))} />
		</BookmarkSlotProvider>
	);
}

test("지도가 받아 둔 상세 캐시가 신선하면 다시 받지 않아도 그 찜 여부를 보인다(지도 카드에서 찜한 뒤 연 시트의 하트가 대기로 남던 사고)", async () => {
	signInAsMember();
	const { queryClient, user } = renderWithProviders(<DetailSheetOpener />);
	queryClient.setQueryDefaults(["popups"], { staleTime: APP_STALE_TIME_MS });
	queryClient.setQueryData(popupDetailQueryOptions(POPUP_ID).queryKey, toPopupDetail(buildDetailResponse(true)));

	await user.click(screen.getByRole("button", { name: "시트 열기" }));

	expect(await screen.findByRole("button", { name: HEART_NAME })).toHaveAttribute("aria-pressed", "true");
});

test("서버가 토큰 없이 준 값만 있고 다시 받기가 실패하면 찜 여부를 모름으로 두어 누를 수 없다", async () => {
	const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
	signInAsMember();
	server.use(http.get(`/api/v1/popups/${String(POPUP_ID)}`, () => apiError(500, "E500")));
	renderDetailBookmark();

	await waitFor(() => {
		expect(consoleError).toHaveBeenCalledWith(expect.stringContaining("[popup]"), expect.anything());
	});

	const heart = screen.getByRole("button", { name: HEART_NAME });

	expect(heart).toHaveAttribute("aria-disabled", "true");
	expect(heart).toHaveAttribute("aria-busy", "true");
});
