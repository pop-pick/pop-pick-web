import { screen, waitFor } from "@testing-library/react";
import { http } from "msw";
import { afterEach, expect, test, vi } from "vitest";

import { toCourse } from "@/features/course/api/get-planner";
import { buildCourseIcs } from "@/features/course/model/course-calendar";

import { signInAsMember } from "../support/auth";
import { freezeSeoulTime } from "../support/clock";
import { apiSuccess, server } from "../support/msw";
import { renderWithProviders } from "../support/render";
import { buildPlannerResponse, buildPlannerStop } from "./support/planner-fixtures";
import { PlannerRoutes } from "./support/planner-routes";

function renderSaved(overrides: Parameters<typeof buildPlannerResponse>[0] = {}) {
	signInAsMember();
	server.use(
		http.get("/api/v1/planners/12", () =>
			apiSuccess(buildPlannerResponse({ plannerId: 12, status: "SCHEDULED", ...overrides }))
		)
	);

	return renderWithProviders(<PlannerRoutes />, { url: "/courses/12/saved" });
}

function unfoldIcs(ics: string) {
	return ics.replaceAll("\r\n ", "");
}

afterEach(() => {
	vi.restoreAllMocks();
	Reflect.deleteProperty(URL, "createObjectURL");
	Reflect.deleteProperty(URL, "revokeObjectURL");
});

test("TC-021 구글 캘린더 버튼은 새 탭에서 서울 시간대의 방문일과 시작 끝 시각, 코스명, 방문 순서가 채워진 일정 등록 화면을 연다", async () => {
	renderSaved();

	const link = await screen.findByRole("link", { name: /구글 캘린더에 저장하기/ });
	const url = new URL(link.getAttribute("href") ?? "");

	expect(url.origin + url.pathname).toBe("https://calendar.google.com/calendar/render");
	expect(url.searchParams.get("action")).toBe("TEMPLATE");
	expect(url.searchParams.get("text")).toBe("성수 감성 팝업 코스");
	expect(url.searchParams.get("dates")).toBe("20261003T140000/20261003T172000");
	expect(url.searchParams.get("ctz")).toBe("Asia/Seoul");
	expect(url.searchParams.get("details")).toBe("1. 14:00 오래오래 함께가게\n2. 15:10 성수 향수 공방");
	expect(link).toHaveAttribute("target", "_blank");
});

test("TC-022 캘린더 파일 다운로드를 누르면 방문일과 시각, 코스명이 든 .ics 파일을 내려받는다", async () => {
	freezeSeoulTime("2026-10-01T09:00:00+09:00");
	const blobs: Blob[] = [];
	Object.assign(URL, {
		createObjectURL: (blob: Blob) => {
			blobs.push(blob);
			return "blob:course";
		},
		revokeObjectURL: () => {}
	});
	const clickedDownloads: string[] = [];
	vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function click(this: HTMLAnchorElement) {
		clickedDownloads.push(this.download);
	});
	const { user } = renderSaved();

	await user.click(await screen.findByRole("button", { name: "캘린더 파일 다운로드" }));

	await waitFor(() => {
		expect(clickedDownloads).toEqual(["pop-pick-course-12.ics"]);
	});
	const [blob] = blobs;
	const ics = unfoldIcs((await blob?.text()) ?? "");

	expect(blob?.type).toContain("text/calendar");
	expect(ics).toContain("BEGIN:VEVENT");
	expect(ics).toContain("DTSTART;TZID=Asia/Seoul:20261003T140000");
	expect(ics).toContain("DTEND;TZID=Asia/Seoul:20261003T172000");
	expect(ics).toContain("SUMMARY:성수 감성 팝업 코스");
});

test("자정을 넘기는 코스의 끝 시각은 다음 날로 적는다", () => {
	const course = toCourse(buildPlannerResponse({ startTime: "22:00", endTime: "00:30", visitDate: "2026-10-31" }));

	const ics = unfoldIcs(buildCourseIcs(course, new Date("2026-10-01T00:00:00Z")));

	expect(ics).toContain("DTSTART;TZID=Asia/Seoul:20261031T220000");
	expect(ics).toContain("DTEND;TZID=Asia/Seoul:20261101T003000");
});

test("코스명과 방문지에 쉼표와 세미콜론이 있어도 한 줄이 75바이트를 넘지 않고 접어 읽으면 원문이 된다", () => {
	const title = "성수, 서울숲; 가을 감성 데이트 코스 가나다라마바사아자차카타파하 가나다라마바사아자차카타파하";
	const course = toCourse(
		buildPlannerResponse({
			title,
			stops: [buildPlannerStop({ title: "어글리 토이; 팝업스토어, 본점 가나다라마바사아자차카타파하" })]
		})
	);

	const ics = buildCourseIcs(course, new Date("2026-10-01T00:00:00Z"));
	const encoder = new TextEncoder();

	for (const line of ics.split("\r\n")) {
		expect(encoder.encode(line).length).toBeLessThanOrEqual(75);
	}
	expect(unfoldIcs(ics)).toContain(String.raw`SUMMARY:성수\, 서울숲\; 가을 감성 데이트 코스`);
	expect(unfoldIcs(ics)).toContain(String.raw`DESCRIPTION:1. 14:00 어글리 토이\; 팝업스토어\, 본점`);
});
