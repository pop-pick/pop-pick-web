import { screen, within } from "@testing-library/react";
import { http } from "msw";
import { expect, test } from "vitest";

import { signInAsMember } from "../support/auth";
import { apiError, apiSuccess, server } from "../support/msw";
import { renderWithProviders } from "../support/render";
import { buildPlannerPage, buildPlannerSummary } from "./support/planner-fixtures";
import { PlannerRoutes } from "./support/planner-routes";

function renderPlannerHome() {
	signInAsMember();

	return renderWithProviders(<PlannerRoutes />, { url: "/planner" });
}

async function findCourseCards() {
	return within(await screen.findByRole("list", { name: "저장한 일정" })).findAllByRole("link");
}

test("TC-025 다가오는 일정이 기본으로 보이고 카드에 날짜와 코스명, 총 소요시간, 등록일이 있으며 다른 탭을 고르면 그 탭의 일정이 보인다", async () => {
	server.use(
		http.get("/api/v1/planners", ({ request }) => {
			const tab = new URL(request.url).searchParams.get("tab");
			const title = tab === "PAST" ? "지난 홍대 코스" : "다가오는 성수 코스";

			return apiSuccess(buildPlannerPage([buildPlannerSummary({ title })]));
		})
	);
	const { user } = renderPlannerHome();

	const [upcomingCard] = await findCourseCards();

	expect(screen.getByRole("tab", { name: "다가오는 일정" })).toHaveAttribute("aria-selected", "true");
	expect(upcomingCard).toHaveTextContent("2026년 10월 3일 (토)");
	expect(upcomingCard).toHaveTextContent("다가오는 성수 코스");
	expect(upcomingCard).toHaveTextContent(/약 3시간 20분\(14:00 ~ 17:20.*팝업 3곳\)/);
	expect(upcomingCard).toHaveTextContent("등록일 2026-09-28");
	expect(upcomingCard).toHaveAttribute("href", "/courses/12");

	await user.click(screen.getByRole("tab", { name: "지난 일정" }));

	expect(await screen.findByText("지난 홍대 코스")).toBeInTheDocument();
	expect(screen.queryByText("다가오는 성수 코스")).not.toBeInTheDocument();
});

test("일정이 없으면 빈 안내와 코스 만들기 링크가 보인다", async () => {
	server.use(http.get("/api/v1/planners", () => apiSuccess(buildPlannerPage([]))));
	renderPlannerHome();

	expect(await screen.findByRole("link", { name: /나만의 코스 만들기/ })).toHaveAttribute("href", "/planner/new");
	expect(screen.queryByRole("list", { name: "저장한 일정" })).not.toBeInTheDocument();
});

test("일정 목록을 불러오지 못하면 다시 시도로 회복한다", async () => {
	server.use(
		http.get("/api/v1/planners", () => apiError(500, "E0000"), { once: true }),
		http.get("/api/v1/planners", () => apiSuccess(buildPlannerPage([buildPlannerSummary()])))
	);
	const { user } = renderPlannerHome();

	await user.click(await screen.findByRole("button", { name: "다시 시도" }));

	expect(await findCourseCards()).toHaveLength(1);
});

test("다음 페이지가 있으면 이어서 불러와 한 목록에 붙인다", async () => {
	server.use(
		http.get("/api/v1/planners", ({ request }) => {
			const cursor = new URL(request.url).searchParams.get("cursor");

			return cursor === "2026-10-03T14:00_12"
				? apiSuccess(buildPlannerPage([buildPlannerSummary({ plannerId: 13, title: "두 번째 페이지 코스" })]))
				: apiSuccess(buildPlannerPage([buildPlannerSummary()], { hasNext: true, nextCursor: "2026-10-03T14:00_12" }));
		})
	);
	renderPlannerHome();

	expect(await screen.findByText("두 번째 페이지 코스")).toBeInTheDocument();
	expect(await findCourseCards()).toHaveLength(2);
});

test("다음 페이지를 불러오지 못하면 받은 일정은 그대로 두고 목록 끝에서 다시 시도한다", async () => {
	server.use(
		http.get("/api/v1/planners", ({ request }) =>
			new URL(request.url).searchParams.has("cursor")
				? undefined
				: apiSuccess(buildPlannerPage([buildPlannerSummary()], { hasNext: true, nextCursor: "next" }))
		),
		http.get("/api/v1/planners", () => apiError(500, "E0000"), { once: true }),
		http.get("/api/v1/planners", () =>
			apiSuccess(buildPlannerPage([buildPlannerSummary({ plannerId: 13, title: "두 번째 페이지 코스" })]))
		)
	);
	const { user } = renderPlannerHome();

	const retryButton = await screen.findByRole("button", { name: "다시 시도" });

	expect(await findCourseCards()).toHaveLength(1);

	await user.click(retryButton);

	expect(await screen.findByText("두 번째 페이지 코스")).toBeInTheDocument();
	expect(await findCourseCards()).toHaveLength(2);
});

test("저장 직후 목록을 다시 읽다 실패하면 빈 일정 안내 대신 불러오지 못했다고 알린다", async () => {
	server.use(http.get("/api/v1/planners", () => apiSuccess(buildPlannerPage([]))));
	const { queryClient } = renderPlannerHome();
	await screen.findByRole("link", { name: /나만의 코스 만들기/ });

	server.use(http.get("/api/v1/planners", () => apiError(500, "E0000")));
	await queryClient.invalidateQueries({ queryKey: ["course", "list"] });

	expect(await screen.findByRole("button", { name: "다시 시도" })).toBeInTheDocument();
	expect(screen.queryByText("아직 저장된 일정이 없어요.")).not.toBeInTheDocument();
});
