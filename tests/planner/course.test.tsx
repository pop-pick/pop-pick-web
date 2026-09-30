import { screen, waitFor, within } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { expect, test } from "vitest";

import { signInAsMember } from "../support/auth";
import { apiError, apiSuccess, server } from "../support/msw";
import { renderWithProviders } from "../support/render";
import {
	buildPlannerFormResponse,
	buildPlannerPage,
	buildPlannerResponse,
	buildPlannerStop
} from "./support/planner-fixtures";
import { PlannerRoutes } from "./support/planner-routes";

function renderCourse(planner: ReturnType<typeof buildPlannerResponse>, url = `/courses/${String(planner.plannerId)}`) {
	signInAsMember();
	server.use(http.get(`/api/v1/planners/${String(planner.plannerId)}`, () => apiSuccess(planner)));

	return renderWithProviders(<PlannerRoutes />, { url });
}

test("생성된 코스를 저장하면 등록 완료 화면으로 가서 등록일을 서울 날짜로 보인다", async () => {
	let planner = buildPlannerResponse({ plannerId: 12, status: "DRAFT" });
	signInAsMember();
	server.use(
		http.get("/api/v1/planners/12", () => apiSuccess(planner)),
		http.post("/api/v1/planners/12/confirm", () => {
			planner = { ...planner, status: "SCHEDULED", confirmedAt: "2026-10-01T01:30:00+09:00" };
			return apiSuccess(planner);
		})
	);
	const { user, router } = renderWithProviders(<PlannerRoutes />, { url: "/courses/12" });

	expect(await screen.findByRole("heading", { name: /성수/ })).toBeInTheDocument();
	expect(within(screen.getByRole("list", { name: "방문 순서" })).getAllByRole("listitem")).toHaveLength(2);

	await user.click(screen.getByRole("button", { name: "내 플래너에 저장하기" }));

	await waitFor(() => {
		expect(router).toMatchObject({ pathname: "/courses/12/saved" });
	});
	expect(await screen.findByText("등록일 2026-10-01")).toBeInTheDocument();
});

test("방문일이 지난 코스를 저장하려 하면 저장하지 못한 이유를 알린다", async () => {
	server.use(http.post("/api/v1/planners/12/confirm", () => apiError(400, "E3002")));
	const { user, router } = renderCourse(buildPlannerResponse({ plannerId: 12, status: "DRAFT" }));

	await user.click(await screen.findByRole("button", { name: "내 플래너에 저장하기" }));

	expect(await screen.findByRole("alertdialog", { name: /방문 날짜가 지난/ })).toBeInTheDocument();
	expect(router).toMatchObject({ pathname: "/courses/12" });
});

test("다시 생성하기는 코스 주소에 조건 쿼리가 있으면 그 조건을 그대로 조건 입력에 넘긴다", async () => {
	server.use(http.get("/api/v1/planners/form", () => apiSuccess(buildPlannerFormResponse())));
	const { user, router } = renderCourse(
		buildPlannerResponse({ plannerId: 12 }),
		"/courses/12?area=2&companion=COUPLE&category=12&date=2026-10-05&start=10:00&duration=SHORT&note=굿즈"
	);

	await user.click(await screen.findByRole("link", { name: "다시 생성하기" }));

	expect(router).toMatchObject({
		pathname: "/planner/new",
		query: {
			area: "2",
			companion: "COUPLE",
			category: "12",
			date: "2026-10-05",
			start: "10:00",
			duration: "SHORT",
			note: "굿즈"
		}
	});
});

test("다시 생성하기는 조건 쿼리가 없으면 코스의 지역과 동행, 날짜, 시작 시각, 소요 시간으로 조건 입력을 연다", async () => {
	server.use(http.get("/api/v1/planners/form", () => apiSuccess(buildPlannerFormResponse())));
	const { user, router } = renderCourse(
		buildPlannerResponse({
			plannerId: 12,
			area: { id: 3, name: "잠실" },
			accompanyType: "ALONE",
			visitDate: "2026-10-07",
			startTime: "11:00",
			durationType: "SHORT"
		})
	);

	await user.click(await screen.findByRole("link", { name: "다시 생성하기" }));

	expect(router).toMatchObject({
		pathname: "/planner/new",
		query: { area: "3", companion: "ALONE", date: "2026-10-07", start: "11:00", duration: "SHORT" }
	});
});

test("저장한 일정을 삭제 확인 뒤 지우면 플래너 홈으로 간다", async () => {
	server.use(
		http.delete("/api/v1/planners/12", () => new HttpResponse(null, { status: 204 })),
		http.get("/api/v1/planners", () => apiSuccess(buildPlannerPage([])))
	);
	const { user, router } = renderCourse(buildPlannerResponse({ plannerId: 12, status: "SCHEDULED" }));

	await user.click(await screen.findByRole("button", { name: "삭제하기" }));
	await user.click(within(await screen.findByRole("alertdialog")).getByRole("button", { name: "삭제" }));

	await waitFor(() => {
		expect(router).toMatchObject({ pathname: "/planner" });
	});
});

test("일정 삭제가 실패하면 삭제하지 못했다고 알리고 그 화면에 남는다", async () => {
	server.use(http.delete("/api/v1/planners/12", () => apiError(500, "E0000")));
	const { user, router } = renderCourse(buildPlannerResponse({ plannerId: 12, status: "SCHEDULED" }));

	await user.click(await screen.findByRole("button", { name: "삭제하기" }));
	await user.click(within(await screen.findByRole("alertdialog")).getByRole("button", { name: "삭제" }));

	expect(await screen.findByRole("alertdialog", { name: /삭제하지 못했/ })).toBeInTheDocument();
	expect(router).toMatchObject({ pathname: "/courses/12" });
});

test("취소된 일정에는 삭제하기가 없다", async () => {
	renderCourse(buildPlannerResponse({ plannerId: 12, status: "CANCELED" }));

	expect(await screen.findByRole("button", { name: "공유하기" })).toBeInTheDocument();
	expect(screen.queryByRole("button", { name: "삭제하기" })).not.toBeInTheDocument();
});

test.each([
	{ status: 404, errorCode: "E3000" },
	{ status: 403, errorCode: "E3001" }
])("없거나 남의 코스($errorCode)는 볼 수 없다고 알리고 플래너로 가는 링크를 준다", async ({ status, errorCode }) => {
	signInAsMember();
	server.use(http.get("/api/v1/planners/12", () => apiError(status, errorCode)));
	renderWithProviders(<PlannerRoutes />, { url: "/courses/12" });

	expect(await screen.findByText(/볼 수 없는 코스/)).toBeInTheDocument();
	expect(screen.getByRole("link", { name: "플래너로 가기" })).toHaveAttribute("href", "/planner");
});

test("팝업이 지워진 방문지는 팝업 상세로 가지 않고 남은 방문지는 팝업 상세로 가며 도보 구간의 분과 거리가 보인다", async () => {
	renderCourse(
		buildPlannerResponse({
			plannerId: 12,
			status: "SCHEDULED",
			stops: [
				buildPlannerStop({ visitOrder: 1, popupId: null, title: "사라진 팝업", nextTravelMin: 12, nextTravelM: 1336 }),
				buildPlannerStop({ visitOrder: 2, popupId: 1702, title: "성수 향수 공방" })
			]
		})
	);

	const timeline = await screen.findByRole("list", { name: "방문 순서" });

	expect(within(timeline).queryByRole("link", { name: /사라진 팝업/ })).not.toBeInTheDocument();
	expect(within(timeline).getByText("사라진 팝업")).toBeInTheDocument();
	expect(within(timeline).getByRole("link", { name: /성수 향수 공방/ })).toHaveAttribute("href", "/popups/1702");
	expect(within(timeline).getByText(/12분/)).toHaveTextContent(/1\.3km/);
});
