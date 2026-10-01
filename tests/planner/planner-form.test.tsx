import { screen, waitFor, within } from "@testing-library/react";
import { type DefaultBodyType, delay, http, type PathParams } from "msw";
import { expect, test, vi } from "vitest";

import type { GeneratePlannerRequest } from "@/features/planner/model/course-request";
import type { ApiResponse } from "@/shared/api/types";

import { signInAsMember } from "../support/auth";
import { freezeSeoulTime } from "../support/clock";
import { apiError, apiSuccess, server } from "../support/msw";
import { renderWithProviders } from "../support/render";
import { buildPlannerFormResponse, buildPlannerPage, buildPlannerResponse } from "./support/planner-fixtures";
import {
	fillRequiredConditions,
	getDateButton,
	getOptionGroup,
	getStartTimeButton,
	openStartTimes,
	pickDate,
	submitCourse,
	waitForPlannerForm
} from "./support/planner-form";
import { PlannerRoutes } from "./support/planner-routes";

// 생성 중 화면의 Lottie는 jsdom에 없는 캔버스를 찾는다. 애니메이션은 이 테스트의 관심사가 아니다
vi.mock("lottie-web/build/player/lottie_light", () => ({
	default: { loadAnimation: () => ({ goToAndPlay: () => {}, destroy: () => {} }) }
}));

const EXPECTED_REQUEST: GeneratePlannerRequest = {
	areaId: 2,
	visitDate: "2026-10-03",
	startTime: "14:00",
	accompanyType: "WITH_FRIEND",
	durationType: "HALF_DAY",
	interestCategoryIds: [11],
	preferredActivityIds: [21],
	note: null
};

function renderPlannerNew(url = "/planner/new") {
	signInAsMember();
	server.use(http.get("/api/v1/planners/form", () => apiSuccess(buildPlannerFormResponse())));

	return renderWithProviders(<PlannerRoutes />, { url });
}

function getChecked(groupTitle: string) {
	return within(getOptionGroup(groupTitle))
		.queryAllByRole(groupTitle === "관심 카테고리" || groupTitle === "선호 활동" ? "checkbox" : "radio", {
			checked: true
		})
		.map((input) => input.closest("label")?.textContent);
}

test("회원의 온보딩 값이 미리 골라지고 필수 조건을 채워 생성하면 고른 조건 그대로 요청되어 그 코스 화면으로 조건과 함께 간다", async () => {
	freezeSeoulTime("2026-10-01T10:00:00+09:00");
	let releaseGeneration = () => {};
	const generationReleased = new Promise<void>((resolve) => {
		releaseGeneration = resolve;
	});
	server.use(
		http.post<PathParams, DefaultBodyType, ApiResponse<unknown>>("/api/v1/planners/generate", async ({ request }) => {
			const body = await request.json();
			await generationReleased;

			return expect.objectContaining(EXPECTED_REQUEST).asymmetricMatch(body)
				? apiSuccess({ plannerId: 12 })
				: apiError(400, "E0002", "화면에서 고른 조건과 다른 요청");
		}),
		http.get("/api/v1/planners/12", () => apiSuccess(buildPlannerResponse({ plannerId: 12 })))
	);
	const { user, router } = renderPlannerNew();
	const submitButton = await waitForPlannerForm();

	expect(getChecked("지역")).toEqual(["성수"]);
	expect(getChecked("관심 카테고리")).toEqual(["캐릭터"]);
	expect(getChecked("선호 활동")).toEqual(["포토존"]);
	expect(submitButton).toBeDisabled();

	await fillRequiredConditions(user, { area: "홍대" });
	expect(submitButton).toBeEnabled();
	await submitCourse(user);

	expect(await screen.findByRole("region", { name: "코스 생성 단계" })).toBeInTheDocument();
	releaseGeneration();

	await waitFor(() => {
		expect(router).toMatchObject({
			pathname: "/courses/12",
			query: { area: "2", companion: "WITH_FRIEND", date: "2026-10-03", start: "14:00", duration: "HALF_DAY" }
		});
	});
	expect(await screen.findByRole("list", { name: "방문 순서" })).toBeInTheDocument();
});

test("생성 중에 취소하면 조건 입력으로 돌아오고 고른 값이 남는다", async () => {
	freezeSeoulTime("2026-10-01T10:00:00+09:00");
	server.use(
		http.post("/api/v1/planners/generate", async () => {
			await delay("infinite");
			return apiSuccess({ plannerId: 12 });
		})
	);
	const { user, router } = renderPlannerNew();
	await waitForPlannerForm();
	await fillRequiredConditions(user, { area: "잠실", companion: "가족과" });
	await submitCourse(user);

	await user.click(await screen.findByRole("button", { name: "취소하기" }));

	expect(await waitForPlannerForm()).toBeEnabled();
	expect(getChecked("지역")).toEqual(["잠실"]);
	expect(getChecked("동행 유형")).toEqual(["가족과"]);
	expect(getDateButton()).toHaveAccessibleName(/2026-10-03/);
	expect(router).toMatchObject({ pathname: "/planner/new" });
});

test("조건에 맞는 팝업이 부족해 생성이 실패하면 이유를 알리고 닫으면 고른 조건이 남는다", async () => {
	freezeSeoulTime("2026-10-01T10:00:00+09:00");
	server.use(http.post("/api/v1/planners/generate", () => apiError(422, "E3004")));
	const { user } = renderPlannerNew();
	await waitForPlannerForm();
	await fillRequiredConditions(user, { area: "홍대" });
	await submitCourse(user);

	const alert = await screen.findByRole("alertdialog", { name: /팝업이 부족/ });
	await user.click(within(alert).getByRole("button", { name: "확인" }));

	await waitFor(() => {
		expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
	});
	expect(getChecked("지역")).toEqual(["홍대"]);
	expect(screen.getByRole("button", { name: "AI 코스 생성하기" })).toBeEnabled();
});

test.each([
	{ now: "2026-10-01T12:30:00+09:00", earliest: "13:00" },
	{ now: "2026-10-01T12:31:00+09:00", earliest: "14:00" }
])("오늘 방문이면 $now 기준 30분 뒤보다 이른 시작 시각은 고를 수 없다", async ({ now, earliest }) => {
	freezeSeoulTime(now);
	const { user } = renderPlannerNew();
	await waitForPlannerForm();

	await pickDate(user, "2026-10-01");

	expect((await openStartTimes(user))[0]).toBe(earliest);
});

test("오늘 고를 수 있는 시작 시각이 남지 않았으면 오늘은 달력에서 고를 수 없고 주소의 오늘 날짜도 버린다", async () => {
	freezeSeoulTime("2026-10-01T19:31:00+09:00");
	const { user } = renderPlannerNew("/planner/new?date=2026-10-01");
	await waitForPlannerForm();

	expect(getDateButton()).toHaveAccessibleName(/YYYY-MM-DD/);

	await user.click(getDateButton());
	const calendar = await screen.findByRole("dialog", { name: "날짜 선택 달력" });

	expect(within(calendar).getByRole("button", { name: /2026년 10월 1일/ })).toBeDisabled();
	expect(within(calendar).getByRole("button", { name: /2026년 10월 2일/ })).toBeEnabled();
});

test("다시 생성하기로 받은 주소 쿼리의 조건이 채워지고 선택지에 없는 id와 범위 밖 날짜는 버린다", async () => {
	freezeSeoulTime("2026-10-01T10:00:00+09:00");
	renderPlannerNew(
		"/planner/new?area=99&companion=COUPLE&category=12&category=99&date=2026-12-01&start=15:00&duration=SHORT"
	);
	await waitForPlannerForm();

	expect(getChecked("지역")).toEqual([]);
	expect(getChecked("동행 유형")).toEqual(["연인과"]);
	expect(getChecked("관심 카테고리")).toEqual(["패션"]);
	expect(getChecked("선호 활동")).toEqual([]);
	expect(getChecked("가능한 소요 시간")).toEqual([expect.stringMatching(/간편/)]);
	expect(getDateButton()).toHaveAccessibleName(/YYYY-MM-DD/);
	expect(getStartTimeButton()).toHaveAccessibleName(/15:00/);
});

test("조건 입력 선택지를 불러오지 못하면 다시 시도로 회복한다", async () => {
	signInAsMember();
	server.use(
		http.get("/api/v1/planners/form", () => apiError(500, "E0000"), { once: true }),
		http.get("/api/v1/planners/form", () => apiSuccess(buildPlannerFormResponse()))
	);
	const { user } = renderWithProviders(<PlannerRoutes />, { url: "/planner/new" });

	await user.click(await screen.findByRole("button", { name: "다시 시도" }));

	expect(await waitForPlannerForm()).toBeInTheDocument();
});

test("조건 입력 선택지를 불러오지 못해도 머리글의 뒤로 가기로 플래너에 돌아간다", async () => {
	signInAsMember();
	server.use(http.get("/api/v1/planners/form", () => apiError(500, "E0000")));
	server.use(http.get("/api/v1/planners", () => apiSuccess(buildPlannerPage([]))));
	const { user } = renderWithProviders(<PlannerRoutes />, { url: "/planner/new" });

	await screen.findByRole("button", { name: "다시 시도" });
	await user.click(screen.getByRole("button", { name: "뒤로 가기" }));

	expect(await screen.findByRole("tab", { name: "다가오는 일정" })).toBeInTheDocument();
});

test("닫힌 시작 시간 버튼에서 아래 방향키를 누르면 목록이 열리고 키보드로 고를 수 있다", async () => {
	freezeSeoulTime("2026-10-01T10:00:00+09:00");
	const { user } = renderPlannerNew("/planner/new?area=1&companion=WITH_FRIEND&date=2026-10-02");
	await waitForPlannerForm();

	getStartTimeButton().focus();
	await user.keyboard("{ArrowDown}");
	await screen.findByRole("listbox");
	await user.keyboard("{ArrowDown}{Enter}");

	expect(getStartTimeButton()).toHaveAccessibleName(/09:00/);
	expect(getStartTimeButton()).toHaveFocus();
});

test("오늘로 골라 둔 시작 시각이 제출하는 사이 지나면 요청하지 않고 그 칸을 비우며 이유를 알린다", async () => {
	freezeSeoulTime("2026-10-01T18:20:00+09:00");
	const generate = vi.fn(() => apiSuccess(buildPlannerResponse(), { status: 201 }));
	server.use(http.post("/api/v1/planners/generate", generate));
	const { user, router } = renderPlannerNew(
		"/planner/new?area=1&companion=ALONE&date=2026-10-01&start=19:00&duration=SHORT"
	);
	await waitForPlannerForm();

	freezeSeoulTime("2026-10-01T18:40:00+09:00");
	await submitCourse(user);

	expect(await screen.findByRole("alertdialog")).toHaveTextContent(/시작 시간을 다시 골라/);
	expect(generate).not.toHaveBeenCalled();
	expect(getStartTimeButton()).toHaveAccessibleName(/시작 시간$/);
	expect(getDateButton()).toHaveAccessibleName(/2026-10-01/);
	expect(router.pathname).toBe("/planner/new");
});
