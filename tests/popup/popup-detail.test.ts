import { http } from "msw";
import { expect, test } from "vitest";

import { findPopupDetail } from "@/features/popup/api/get-popup-detail";
import { formatEntryFee, formatViewCount } from "@/features/popup/model/detail-format";
import { type PopupDetailResponse, toPopupDetail } from "@/features/popup/model/popup-detail";
import { parsePopupId } from "@/features/popup/model/popup-id";

import { apiError, apiSuccess, server } from "../support/msw";

function buildDetailResponse(overrides: Partial<PopupDetailResponse> = {}) {
	const response: PopupDetailResponse = {
		popupId: 2212,
		title: "시오팡야 팝업스토어",
		description: null,
		imageUrls: ["https://example.com/a.jpg", "https://example.com/b.jpg"],
		interestCategoryId: 3,
		areaName: null,
		startDate: "2026-10-01",
		endDate: "2026-11-30",
		openingHours: null,
		entryFee: null,
		addressRoad: "서울 영등포구 영중로 15",
		addressJibun: "서울 영등포구 영등포동4가 442",
		latitude: 37.517,
		longitude: 126.903,
		reservationType: "UNKNOWN",
		reservationUrl: null,
		viewCount: 0,
		wished: true,
		...overrides
	};

	return response;
}

test("사진 목록이 null이면 갤러리는 비고 대표 사진도 없다", () => {
	const detail = toPopupDetail(buildDetailResponse({ imageUrls: null }));

	expect(detail).toMatchObject({ imageUrls: [], imageUrl: null });
});

test("사진 목록의 첫 장이 대표 사진이다", () => {
	expect(toPopupDetail(buildDetailResponse()).imageUrl).toBe("https://example.com/a.jpg");
});

test("도로명 주소가 없으면 지번 주소를 보이고 둘 다 있으면 도로명을 보인다", () => {
	expect(toPopupDetail(buildDetailResponse({ addressRoad: null })).address).toBe("서울 영등포구 영등포동4가 442");
	expect(toPopupDetail(buildDetailResponse()).address).toBe("서울 영등포구 영중로 15");
});

test("위도와 경도 중 하나라도 없으면 좌표가 없다", () => {
	expect(toPopupDetail(buildDetailResponse({ longitude: null })).position).toBeNull();
	expect(toPopupDetail(buildDetailResponse({ latitude: null })).position).toBeNull();
	expect(toPopupDetail(buildDetailResponse()).position).toEqual({ lat: 37.517, lng: 126.903 });
});

test("찜 여부와 숫자 카테고리를 화면 모델로 옮긴다", () => {
	expect(toPopupDetail(buildDetailResponse())).toMatchObject({ isBookmarked: true, category: "food" });
});

test("입장료 0은 무료 입장이고 null은 입장료 줄을 그리지 않는다", () => {
	expect(formatEntryFee(toPopupDetail(buildDetailResponse({ entryFee: 0 })).entryFee)).toBe("무료 입장");
	expect(formatEntryFee(toPopupDetail(buildDetailResponse({ entryFee: null })).entryFee)).toBeNull();
});

test("조회수는 만 단위부터 소수 첫째 자리까지 내려 쓴다", () => {
	expect(formatViewCount(0)).toBe("조회수 0");
	expect(formatViewCount(9_999)).toBe("조회수 9,999");
	expect(formatViewCount(10_000)).toBe("조회수 1만");
	expect(formatViewCount(12_345)).toBe("조회수 1.2만");
	expect(formatViewCount(100_000)).toBe("조회수 10만");
});

test("팝업 id는 안전한 양의 정수 문자열만 받는다", () => {
	expect(parsePopupId("2212")).toBe(2212);
	expect(parsePopupId("0")).toBeNull();
	expect(parsePopupId("abc")).toBeNull();
	expect(parsePopupId("9223372036854775807")).toBeNull();
});

test("없는 팝업(E404)은 null이고 그 밖의 실패는 그대로 던진다", async () => {
	server.use(
		http.get("*/api/v1/popups/1", () => apiError(404, "E404")),
		http.get("*/api/v1/popups/2", () => apiError(400, "E400")),
		http.get("*/api/v1/popups/3", () => apiSuccess(buildDetailResponse({ popupId: 3 })))
	);

	expect(await findPopupDetail(1)).toBeNull();
	await expect(findPopupDetail(2)).rejects.toMatchObject({ errorCode: "E400" });
	expect(await findPopupDetail(3)).toMatchObject({ id: 3 });
});
