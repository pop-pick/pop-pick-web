import { screen, within } from "@testing-library/react";
import { delay, http } from "msw";
import type { ReactNode } from "react";
import { afterEach, expect, test, vi } from "vitest";

import { ExploreView } from "@/features/popup/components/ExploreView";
import type { PopupMapItemResponse } from "@/features/popup/model/explore-popup";
import { BookmarkSlotContext } from "@/shared/components/BookmarkSlot";
import type { KakaoBoundsLiteral } from "@/shared/lib/kakao-map/kakao-map-utils";

import { apiError, apiSuccess, server } from "../support/msw";
import { renderWithProviders } from "../support/render";

const SEONGSU_BOUNDS: KakaoBoundsLiteral = { swLat: 37.52, swLng: 127.03, neLat: 37.57, neLng: 127.09 };
const HONGDAE_BOUNDS: KakaoBoundsLiteral = { swLat: 37.54, swLng: 126.9, neLat: 37.58, neLng: 126.96 };

interface FakeKakaoMapProps {
	label: string;
	markers?: { id: string; title: string }[];
	myPosition?: { lat: number; lng: number } | null;
	onMarkerClick: (markerId: string) => void;
	onBoundsChange?: (bounds: KakaoBoundsLiteral) => void;
	children: ReactNode;
}

vi.mock("@/shared/lib/kakao-map/KakaoMap", async () => {
	const { useEffect } = await import("react");

	return {
		KakaoMap: ({
			label,
			markers = [],
			myPosition = null,
			onMarkerClick,
			onBoundsChange,
			children
		}: FakeKakaoMapProps) => {
			useEffect(() => {
				onBoundsChange?.(SEONGSU_BOUNDS);
			}, [onBoundsChange]);

			const handleMoveClick = () => {
				onBoundsChange?.(HONGDAE_BOUNDS);
			};

			return (
				<div role="region" aria-label={label}>
					<button type="button" onClick={handleMoveClick}>
						홍대로 이동
					</button>
					{markers.map((marker) => (
						<button key={marker.id} type="button" onClick={() => onMarkerClick(marker.id)}>
							{`핀 ${marker.title}`}
						</button>
					))}
					{myPosition !== null && <span>{`내 위치 ${JSON.stringify(myPosition)}`}</span>}
					{children}
				</div>
			);
		}
	};
});

vi.mock("@/features/popup/components/SelectedPinReveal", () => ({ SelectedPinReveal: () => null }));

function buildMapItem(popupId: number, title: string) {
	const item: PopupMapItemResponse = {
		popupId,
		latitude: 37.54,
		longitude: 127.05,
		title,
		imageUrl: null,
		interestCategoryId: null,
		areaName: "성수",
		endDate: "2026-12-31",
		reservationType: "RESERVATION"
	};

	return item;
}

function isBoundsOf(searchParams: URLSearchParams, bounds: KakaoBoundsLiteral) {
	const isNear = (name: string, expected: number) => Math.abs(Number(searchParams.get(name)) - expected) < 0.002;

	return (
		isNear("swLat", bounds.swLat) &&
		isNear("swLng", bounds.swLng) &&
		isNear("neLat", bounds.neLat) &&
		isNear("neLng", bounds.neLng)
	);
}

/** 영역과 검색어가 맞는 요청에만 핀을 준다. 맞지 않으면 빈 영역이다 */
function serveMapPopups(byArea: { bounds: KakaoBoundsLiteral; keyword?: string; items: PopupMapItemResponse[] }[]) {
	server.use(
		http.get("*/api/v1/popups/map", ({ request }) => {
			const { searchParams } = new URL(request.url);
			const keyword = searchParams.get("keyword") ?? undefined;
			const matched = byArea.find((area) => isBoundsOf(searchParams, area.bounds) && area.keyword === keyword);

			return apiSuccess(matched?.items ?? []);
		})
	);
}

function renderExplore(url = "/explore") {
	const renderBookmarkState = ({ isBookmarked }: { isBookmarked: boolean | null }) => (
		<span>{`찜 상태 ${String(isBookmarked)}`}</span>
	);

	return renderWithProviders(
		<BookmarkSlotContext value={renderBookmarkState}>
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

test("TC-006 탐색에 들어오면 지도가 기본으로 보이고 지도 영역 안 팝업이 핀이 된다", async () => {
	serveMapPopups([{ bounds: SEONGSU_BOUNDS, items: [buildMapItem(1, "성수 팝업"), buildMapItem(3, "뚝섬 팝업")] }]);
	renderExplore();

	const map = await screen.findByRole("region", { name: "팝업 지도, 2곳" });

	expect(within(map).getByRole("button", { name: "핀 성수 팝업" })).toBeInTheDocument();
	expect(within(map).getByRole("button", { name: "핀 뚝섬 팝업" })).toBeInTheDocument();
	expect(screen.getByRole("radio", { name: "지도" })).toBeChecked();
});

test("TC-006 지도를 다른 영역으로 옮기면 그 영역의 팝업으로 핀이 바뀐다", async () => {
	serveMapPopups([
		{ bounds: SEONGSU_BOUNDS, items: [buildMapItem(1, "성수 팝업")] },
		{ bounds: HONGDAE_BOUNDS, items: [buildMapItem(2, "홍대 팝업")] }
	]);
	const { user } = renderExplore();

	await user.click(await screen.findByRole("button", { name: "핀 성수 팝업" }));
	await user.click(screen.getByRole("button", { name: "홍대로 이동" }));

	expect(await screen.findByRole("button", { name: "핀 홍대 팝업" })).toBeInTheDocument();
	expect(screen.queryByRole("button", { name: "핀 성수 팝업" })).not.toBeInTheDocument();
});

test("TC-006 핀을 누르면 하단 카드가 지도 응답만으로 뜨고 찜 여부는 모름으로 둔다", async () => {
	serveMapPopups([{ bounds: SEONGSU_BOUNDS, items: [buildMapItem(1, "성수 팝업")] }]);
	const { user } = renderExplore();

	await user.click(await screen.findByRole("button", { name: "핀 성수 팝업" }));

	const card = await screen.findByRole("region", { name: "선택한 팝업" });

	expect(within(card).getByText("성수")).toBeInTheDocument();
	expect(within(card).getByText("예약 필요", { exact: false })).toBeInTheDocument();
	expect(within(card).getByRole("link", { name: /성수 팝업/ })).toHaveAttribute("href", "/explore/popups/1");
	expect(within(card).getByText("찜 상태 null")).toBeInTheDocument();
});

test("TC-006 지도를 옮겨 핀이 사라져도 고른 팝업의 카드는 남는다", async () => {
	serveMapPopups([{ bounds: SEONGSU_BOUNDS, items: [buildMapItem(1, "성수 팝업")] }]);
	const { user } = renderExplore();

	await user.click(await screen.findByRole("button", { name: "핀 성수 팝업" }));
	await user.click(screen.getByRole("button", { name: "홍대로 이동" }));

	expect(await screen.findByText("지도에 표시할 팝업이 없어요.")).toBeInTheDocument();
	expect(screen.getByRole("region", { name: "선택한 팝업" })).toBeInTheDocument();
});

test("TC-006 검색어를 바꾸면 이전 검색어로 고른 팝업의 카드는 닫힌다", async () => {
	serveMapPopups([
		{ bounds: SEONGSU_BOUNDS, items: [buildMapItem(1, "성수 팝업")] },
		{ bounds: SEONGSU_BOUNDS, keyword: "전시", items: [buildMapItem(2, "뚝섬 전시")] }
	]);
	const { user } = renderExplore();

	await user.click(await screen.findByRole("button", { name: "핀 성수 팝업" }));
	await user.type(screen.getByRole("searchbox", { name: "팝업 검색" }), "전시");

	expect(await screen.findByRole("button", { name: "핀 뚝섬 전시" })).toBeInTheDocument();
	expect(screen.queryByRole("region", { name: "선택한 팝업" })).not.toBeInTheDocument();
});

test("TC-006 검색어를 지도 요청에 함께 보내고 그 검색어의 핀만 보인다", async () => {
	serveMapPopups([
		{ bounds: SEONGSU_BOUNDS, items: [buildMapItem(1, "성수 팝업"), buildMapItem(2, "뚝섬 전시")] },
		{ bounds: SEONGSU_BOUNDS, keyword: "전시", items: [buildMapItem(2, "뚝섬 전시")] }
	]);
	renderExplore("/explore?q=전시");

	expect(await screen.findByRole("region", { name: "팝업 지도, 1곳" })).toBeInTheDocument();
	expect(screen.getByRole("button", { name: "핀 뚝섬 전시" })).toBeInTheDocument();
});

test("TC-006 보이는 영역에 팝업이 없으면 빈 지도 대신 안내를 보인다", async () => {
	serveMapPopups([]);
	renderExplore();

	expect(await screen.findByText("지도에 표시할 팝업이 없어요.")).toBeInTheDocument();
});

test("TC-006 지도 팝업을 받지 못하면 실패 안내를 보이고 다시 시도하면 핀이 나온다", async () => {
	vi.spyOn(console, "error").mockImplementation(() => undefined);
	serveMapPopups([{ bounds: SEONGSU_BOUNDS, items: [buildMapItem(1, "성수 팝업")] }]);
	server.use(http.get("*/api/v1/popups/map", () => apiError(500, "E500"), { once: true }));
	const { user } = renderExplore();

	await user.click(await screen.findByRole("button", { name: "다시 시도" }));

	expect(await screen.findByRole("button", { name: "핀 성수 팝업" })).toBeInTheDocument();
});

test("TC-007 위치 권한을 허용하면 현재 위치가 지도에 전달된다", async () => {
	serveMapPopups([{ bounds: SEONGSU_BOUNDS, items: [buildMapItem(1, "성수 팝업")] }]);
	stubGeolocation((onSuccess) => {
		onSuccess({ coords: { latitude: 37.5, longitude: 127.1 } } as GeolocationPosition);
	});
	renderExplore();

	expect(await screen.findByText(/내 위치/)).toHaveTextContent('{"lat":37.5,"lng":127.1}');
});

test("TC-007 위치 권한을 거부하면 서울 기본 위치라는 안내를 보이고 현재 위치 버튼을 누를 수 없다", async () => {
	vi.spyOn(console, "info").mockImplementation(() => undefined);
	serveMapPopups([{ bounds: SEONGSU_BOUNDS, items: [buildMapItem(1, "성수 팝업")] }]);
	stubGeolocation((_, onError) => {
		onError?.({ code: 1, PERMISSION_DENIED: 1 } as GeolocationPositionError);
	});
	renderExplore();

	expect(await screen.findByText("위치 권한을 거부해 서울 기본 위치를 보여줍니다")).toBeInTheDocument();
	expect(screen.getByRole("button", { name: "현재 위치로 이동" })).toHaveAttribute("aria-disabled", "true");
	expect(screen.queryByText(/내 위치/)).not.toBeInTheDocument();
});

test("TC-007 위치를 쓸 수 없어도 Esc로 카드를 닫으면 포커스가 현재 위치 버튼으로 간다", async () => {
	vi.spyOn(console, "info").mockImplementation(() => undefined);
	serveMapPopups([{ bounds: SEONGSU_BOUNDS, items: [buildMapItem(1, "성수 팝업")] }]);
	stubGeolocation((_, onError) => {
		onError?.({ code: 1, PERMISSION_DENIED: 1 } as GeolocationPositionError);
	});
	const { user } = renderExplore();

	await user.click(await screen.findByRole("button", { name: "핀 성수 팝업" }));
	await user.keyboard("{Escape}");

	expect(screen.queryByRole("region", { name: "선택한 팝업" })).not.toBeInTheDocument();
	expect(screen.getByRole("button", { name: "현재 위치로 이동" })).toHaveFocus();
});

test("TC-006 빈 영역에서 새 영역으로 옮기면 새 결과가 오기 전에는 빈 영역 안내를 거둔다", async () => {
	server.use(
		http.get("*/api/v1/popups/map", async ({ request }) => {
			if (isBoundsOf(new URL(request.url).searchParams, HONGDAE_BOUNDS)) {
				await delay("infinite");
			}

			return apiSuccess([]);
		})
	);
	const { user } = renderExplore();

	expect(await screen.findByText("지도에 표시할 팝업이 없어요.")).toBeInTheDocument();

	await user.click(screen.getByRole("button", { name: "홍대로 이동" }));

	expect(screen.queryByText("지도에 표시할 팝업이 없어요.")).not.toBeInTheDocument();
});

test("TC-008 목록 탭을 누르면 팝업 목록으로 바뀌고 지도 탭을 누르면 지도로 돌아온다", async () => {
	serveMapPopups([{ bounds: SEONGSU_BOUNDS, items: [buildMapItem(1, "성수 팝업")] }]);
	server.use(
		http.get("*/api/v1/popups", () => apiSuccess({ content: [], hasNext: false, nextCursor: null })),
		http.get("*/api/v1/onboardings/favorite-areas", () => apiSuccess([]))
	);
	const { user } = renderExplore();

	await screen.findByRole("region", { name: "팝업 지도, 1곳" });
	await user.click(screen.getByRole("radio", { name: "목록" }));

	expect(await screen.findByText("아직 등록된 팝업이 없어요.", { ignore: ".sr-only" })).toBeInTheDocument();
	expect(screen.queryByRole("region", { name: /팝업 지도/ })).not.toBeInTheDocument();

	await user.click(screen.getByRole("radio", { name: "지도" }));

	expect(await screen.findByRole("region", { name: "팝업 지도, 1곳" })).toBeInTheDocument();
});
