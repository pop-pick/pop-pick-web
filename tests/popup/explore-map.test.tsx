import { screen, within } from "@testing-library/react";
import { http } from "msw";
import type { ReactNode } from "react";
import { afterEach, expect, test, vi } from "vitest";

import { ExploreView } from "@/features/popup/components/ExploreView";
import type { PopupDetailResponse } from "@/features/popup/model/popup-detail";
import type { PageResponse } from "@/shared/api/types";
import { BookmarkSlotContext } from "@/shared/components/BookmarkSlot";
import type { PopupListItemResponse } from "@/shared/model/popup";

import { apiError, apiSuccess, server } from "../support/msw";
import { renderWithProviders } from "../support/render";

interface FakeKakaoMapProps {
	label: string;
	markers?: { id: string; title: string }[];
	myPosition?: { lat: number; lng: number } | null;
	onMarkerClick: (markerId: string) => void;
	children: ReactNode;
}

vi.mock("@/shared/lib/kakao-map/KakaoMap", () => ({
	KakaoMap: ({ label, markers = [], myPosition = null, onMarkerClick, children }: FakeKakaoMapProps) => (
		<div role="region" aria-label={label}>
			{markers.map((marker) => (
				<button key={marker.id} type="button" onClick={() => onMarkerClick(marker.id)}>
					{`핀 ${marker.title}`}
				</button>
			))}
			{myPosition !== null && <span>{`내 위치 ${JSON.stringify(myPosition)}`}</span>}
			{children}
		</div>
	)
}));

vi.mock("@/features/popup/components/SelectedPinReveal", () => ({ SelectedPinReveal: () => null }));

const POPUPS_URL = "*/api/v1/popups";

function buildListItem(popupId: number, title: string) {
	const item: PopupListItemResponse = {
		popupId,
		imageUrl: null,
		interestCategoryId: null,
		areaName: null,
		title,
		endDate: "2026-12-31",
		reservationType: "RESERVATION",
		wished: false
	};

	return item;
}

function buildDetail(popupId: number, title: string, hasPosition = true) {
	const response: PopupDetailResponse = {
		popupId,
		title,
		description: null,
		imageUrls: null,
		interestCategoryId: null,
		areaName: null,
		startDate: null,
		endDate: "2026-12-31",
		openingHours: null,
		entryFee: null,
		addressRoad: null,
		addressJibun: null,
		latitude: hasPosition ? 37.54 : null,
		longitude: hasPosition ? 127.05 : null,
		reservationType: "RESERVATION",
		reservationUrl: null,
		wished: false
	};

	return response;
}

function serveMapPopups(details: PopupDetailResponse[]) {
	const page: PageResponse<PopupListItemResponse> = {
		content: details.map((detail) => buildListItem(detail.popupId, detail.title)),
		hasNext: false,
		nextCursor: null
	};

	server.use(
		http.get(POPUPS_URL, () => apiSuccess(page)),
		...details.map((detail) => http.get(`*/api/v1/popups/${String(detail.popupId)}`, () => apiSuccess(detail)))
	);
}

function renderExplore(url = "/explore") {
	const renderNoBookmark = () => null;

	return renderWithProviders(
		<BookmarkSlotContext value={renderNoBookmark}>
			<ExploreView />
		</BookmarkSlotContext>,
		{ url }
	);
}

function stubGeolocation(getCurrentPosition: Geolocation["getCurrentPosition"]) {
	Object.defineProperty(navigator, "geolocation", {
		value: { getCurrentPosition },
		configurable: true
	});
}

afterEach(() => {
	Reflect.deleteProperty(navigator, "geolocation");
});

test("TC-006 탐색에 들어오면 지도가 기본으로 보이고 좌표가 있는 팝업만 핀이 된다", async () => {
	serveMapPopups([buildDetail(1, "성수 팝업"), buildDetail(2, "좌표 없는 팝업", false), buildDetail(3, "홍대 팝업")]);
	renderExplore();

	const map = await screen.findByRole("region", { name: "팝업 지도, 2곳" });

	expect(within(map).getByRole("button", { name: "핀 성수 팝업" })).toBeInTheDocument();
	expect(within(map).getByRole("button", { name: "핀 홍대 팝업" })).toBeInTheDocument();
	expect(within(map).queryByRole("button", { name: "핀 좌표 없는 팝업" })).not.toBeInTheDocument();
	expect(screen.getByRole("radio", { name: "지도" })).toBeChecked();
});

test("TC-006 핀을 누르면 하단 카드에 팝업 정보가 뜨고 카드를 누르면 상세 시트 주소로 간다", async () => {
	serveMapPopups([buildDetail(1, "성수 팝업")]);
	const { user } = renderExplore();

	await user.click(await screen.findByRole("button", { name: "핀 성수 팝업" }));

	const card = await screen.findByRole("region", { name: "선택한 팝업" });

	expect(within(card).getByText("예약 필요", { exact: false })).toBeInTheDocument();
	expect(within(card).getByRole("link", { name: /성수 팝업/ })).toHaveAttribute("href", "/explore/popups/1");
});

test("TC-006 좌표가 있는 팝업이 하나도 없으면 빈 지도 대신 안내를 보인다", async () => {
	serveMapPopups([buildDetail(1, "좌표 없는 팝업", false)]);
	renderExplore();

	expect(await screen.findByText("지도에 표시할 팝업이 없어요.")).toBeInTheDocument();
});

test("TC-006 상세 일부를 받지 못하면 실패 안내를 보이고 다시 시도하면 그 핀이 나온다", async () => {
	vi.spyOn(console, "error").mockImplementation(() => undefined);
	serveMapPopups([buildDetail(1, "성수 팝업")]);
	server.use(http.get("*/api/v1/popups/1", () => apiError(500, "E500"), { once: true }));
	const { user } = renderExplore();

	await user.click(await screen.findByRole("button", { name: "다시 시도" }));

	expect(await screen.findByRole("button", { name: "핀 성수 팝업" })).toBeInTheDocument();
});

test("TC-007 위치 권한을 허용하면 현재 위치가 지도에 전달된다", async () => {
	serveMapPopups([buildDetail(1, "성수 팝업")]);
	stubGeolocation((onSuccess) => {
		onSuccess({ coords: { latitude: 37.5, longitude: 127.1 } } as GeolocationPosition);
	});
	renderExplore();

	expect(await screen.findByText(/내 위치/)).toHaveTextContent('{"lat":37.5,"lng":127.1}');
});

test("TC-007 위치 권한을 거부하면 서울 기본 위치라는 안내를 보이고 현재 위치 버튼을 누를 수 없다", async () => {
	vi.spyOn(console, "info").mockImplementation(() => undefined);
	serveMapPopups([buildDetail(1, "성수 팝업")]);
	stubGeolocation((_, onError) => {
		onError?.({ code: 1, PERMISSION_DENIED: 1 } as GeolocationPositionError);
	});
	renderExplore();

	expect(await screen.findByText("위치 권한을 거부해 서울 기본 위치를 보여줍니다")).toBeInTheDocument();
	expect(screen.getByRole("button", { name: "현재 위치로 이동" })).toBeDisabled();
	expect(screen.queryByText(/내 위치/)).not.toBeInTheDocument();
});

test("TC-008 목록 탭을 누르면 팝업 목록으로 바뀌고 지도 탭을 누르면 지도로 돌아온다", async () => {
	serveMapPopups([buildDetail(1, "성수 팝업")]);
	const { user } = renderExplore();

	await screen.findByRole("region", { name: "팝업 지도, 1곳" });
	await user.click(screen.getByRole("radio", { name: "목록" }));

	expect(await screen.findByRole("link", { name: /성수 팝업/ })).toBeInTheDocument();
	expect(screen.queryByRole("region", { name: /팝업 지도/ })).not.toBeInTheDocument();

	await user.click(screen.getByRole("radio", { name: "지도" }));

	expect(await screen.findByRole("region", { name: "팝업 지도, 1곳" })).toBeInTheDocument();
});
