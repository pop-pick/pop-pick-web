import { screen, waitFor, within } from "@testing-library/react";
import { http } from "msw";
import { afterEach, beforeEach, expect, test } from "vitest";

import { OnboardingStepScreen } from "@/features/onboarding/components/OnboardingStepScreen";
import { EMPTY_ANSWERS } from "@/features/onboarding/model/answers";
import type { OnboardingStep } from "@/features/onboarding/model/steps";
import { useOnboardingStore } from "@/features/onboarding/model/useOnboardingStore";

import { signInAsMember } from "../support/auth";
import { apiError, apiSuccess, server } from "../support/msw";
import { renderWithProviders } from "../support/render";

const CATEGORIES = ["캐릭터/IP", "패션", "F&B"].map((category, index) => ({ id: index + 1, category }));
const AREAS = ["성수", "여의도", "홍대", "잠실", "용산", "종로", "강남"].map((area, index) => ({
	id: index + 1,
	area
}));
const ACTIVITIES = ["포토존 촬영", "굿즈 구매"].map((activity, index) => ({ id: index + 1, activity }));

let savedBodies: unknown[];

beforeEach(() => {
	savedBodies = [];
	signInAsMember();
	server.use(
		http.get("*/api/v1/onboardings/interest-categories", () => apiSuccess(CATEGORIES)),
		http.get("*/api/v1/onboardings/favorite-areas", () => apiSuccess(AREAS)),
		http.get("*/api/v1/onboardings/preferred-activities", () => apiSuccess(ACTIVITIES)),
		http.post("*/api/v1/members/me/onboarding", async ({ request }) => {
			savedBodies.push(await request.json());
			return apiSuccess(null);
		})
	);
});

afterEach(() => {
	window.sessionStorage.clear();
	useOnboardingStore.setState({ answers: EMPTY_ANSWERS, loadStatus: "loading" });
});

function renderStep(step: OnboardingStep) {
	return renderWithProviders(<OnboardingStepScreen step={step} />, { url: `/onboarding/${String(step)}` });
}

test("TC-003 동행 유형은 하나만 고르고 다른 항목을 고르면 앞의 선택이 풀린다", async () => {
	const { user, router } = renderStep(1);

	await user.click(await screen.findByRole("radio", { name: "혼자" }));
	await user.click(screen.getByRole("radio", { name: "연인과" }));

	expect(screen.getByRole("radio", { name: "혼자" })).not.toBeChecked();
	expect(screen.getByRole("radio", { name: "연인과" })).toBeChecked();

	await user.click(screen.getByRole("radio", { name: "2명" }));
	await user.click(screen.getByRole("button", { name: "다음" }));

	expect(router.asPath).toBe("/onboarding/2");
	expect(useOnboardingStore.getState().answers).toMatchObject({ companionType: "COUPLE", partySize: 2 });
});

test("TC-003 항목을 고르지 않고 다음을 누르면 알럿이 뜨고 단계가 그대로다", async () => {
	const { user, router } = renderStep(1);

	await user.click(await screen.findByRole("button", { name: "다음" }));

	expect(within(screen.getByRole("alertdialog")).getByText("항목을 선택해주세요")).toBeInTheDocument();
	expect(router.asPath).toBe("/onboarding/1");
});

test("TC-004 1단계를 아무것도 고르지 않고 건너뛰면 2단계로 가고 1단계 답은 저장되지 않는다", async () => {
	const { user, router } = renderStep(1);

	await user.click(await screen.findByRole("button", { name: "건너뛰기" }));

	expect(router.asPath).toBe("/onboarding/2");
	expect(useOnboardingStore.getState().answers).toMatchObject({ companionType: null, partySize: null });
});

test("TC-004 2단계를 건너뛰면 3단계로 가고 고르던 답은 비워진다", async () => {
	useOnboardingStore.setState({ loadStatus: "ready" });
	const { user, router } = renderStep(2);

	await user.click(await screen.findByRole("checkbox", { name: "성수" }));
	await user.click(screen.getByRole("button", { name: "건너뛰기" }));

	expect(router.asPath).toBe("/onboarding/3");
	expect(useOnboardingStore.getState().answers).toMatchObject({ categoryIds: [], areaIds: [] });
});

test("TC-005 관심 카테고리를 여러 개 고르면 선택이 모두 유지되고 다음 단계 값에 담긴다", async () => {
	useOnboardingStore.setState({ loadStatus: "ready" });
	const { user, router } = renderStep(2);

	await user.click(await screen.findByRole("checkbox", { name: "캐릭터/IP" }));
	await user.click(screen.getByRole("checkbox", { name: "F&B" }));
	await user.click(screen.getByRole("checkbox", { name: "성수" }));
	await user.click(screen.getByRole("checkbox", { name: "강남" }));

	expect(screen.getByRole("checkbox", { name: "캐릭터/IP" })).toBeChecked();
	expect(screen.getByRole("checkbox", { name: "F&B" })).toBeChecked();
	expect(screen.getByRole("checkbox", { name: "패션" })).not.toBeChecked();

	await user.click(screen.getByRole("button", { name: "다음" }));

	expect(router.asPath).toBe("/onboarding/3");
	expect(useOnboardingStore.getState().answers).toMatchObject({ categoryIds: [1, 3], areaIds: [1, 7] });
});

test("TC-005 고른 카테고리를 다시 누르면 선택이 풀리고 나머지는 유지된다", async () => {
	useOnboardingStore.setState({ loadStatus: "ready" });
	const { user } = renderStep(2);

	await user.click(await screen.findByRole("checkbox", { name: "패션" }));
	await user.click(screen.getByRole("checkbox", { name: "F&B" }));
	await user.click(screen.getByRole("checkbox", { name: "패션" }));

	expect(screen.getByRole("checkbox", { name: "패션" })).not.toBeChecked();
	expect(screen.getByRole("checkbox", { name: "F&B" })).toBeChecked();
});

test("TC-005 지역 선택지는 백엔드가 준 일곱 곳을 모두 보인다", async () => {
	useOnboardingStore.setState({ loadStatus: "ready" });
	renderStep(2);

	const group = await screen.findByRole("group", { name: /자주 가는 지역/ });

	expect(within(group).getAllByRole("checkbox")).toHaveLength(7);
});

test("온보딩을 끝내면 고른 답을 백엔드 요청 모양으로 저장하고 환영 알럿 확인 뒤 홈으로 간다", async () => {
	useOnboardingStore.setState({
		loadStatus: "ready",
		answers: { ...EMPTY_ANSWERS, companionType: "ALONE", partySize: 1, categoryIds: [2], areaIds: [3] }
	});
	const { user, router } = renderStep(3);

	await user.click(await screen.findByRole("checkbox", { name: "굿즈 구매" }));
	await user.type(screen.getByRole("textbox"), "귀여운 굿즈");
	await user.click(screen.getByRole("button", { name: "POP PICK 시작하기" }));

	await user.click(await screen.findByRole("button", { name: "확인" }));

	expect(savedBodies).toEqual([
		{
			accompanyType: "ALONE",
			numOfAccompany: 1,
			interestCategoryIds: [2],
			favoriteAreaIds: [3],
			preferredActivityIds: [2],
			additionalInfo: "귀여운 굿즈"
		}
	]);
	expect(router.asPath).toBe("/");
	expect(useOnboardingStore.getState().answers).toEqual(EMPTY_ANSWERS);
});

test("저장이 실패하면 고른 답이 남고 다시 시도로 저장한다", async () => {
	useOnboardingStore.setState({ loadStatus: "ready", answers: { ...EMPTY_ANSWERS, categoryIds: [2] } });
	let attempts = 0;
	server.use(
		http.post("*/api/v1/members/me/onboarding", (): Response => {
			attempts += 1;
			return attempts === 1 ? apiError(500, "E500") : apiSuccess(null);
		})
	);
	const { user } = renderStep(3);

	await user.click(await screen.findByRole("checkbox", { name: "포토존 촬영" }));
	await user.click(screen.getByRole("button", { name: "POP PICK 시작하기" }));

	expect(await screen.findByRole("alert")).toHaveTextContent("취향을 저장하지 못했어요");
	expect(useOnboardingStore.getState().answers.categoryIds).toEqual([2]);

	await user.click(screen.getByRole("button", { name: "다시 시도" }));

	await waitFor(() => {
		expect(screen.getByRole("alertdialog")).toHaveTextContent("POP PICK과 시작하는 여정을 환영합니다.");
	});
});

test("선택지 조회가 실패하면 실패 화면을 보이고 다시 시도로 선택지를 불러온다", async () => {
	useOnboardingStore.setState({ loadStatus: "ready" });
	let calls = 0;
	server.use(
		http.get("*/api/v1/onboardings/preferred-activities", (): Response => {
			calls += 1;

			if (calls === 1) {
				return apiError(500, "E500");
			}

			return apiSuccess(ACTIVITIES);
		})
	);
	const { user } = renderStep(3);

	await user.click(await screen.findByRole("button", { name: "다시 시도" }));

	expect(await screen.findByRole("checkbox", { name: "굿즈 구매" })).toBeInTheDocument();
});

test("1단계를 건너뛴 회원의 저장이 400으로 거절되면 같은 요청을 되풀이하지 않고 1단계와 홈으로 가는 길을 준다", async () => {
	useOnboardingStore.setState({ loadStatus: "ready", answers: { ...EMPTY_ANSWERS, categoryIds: [2] } });
	let attempts = 0;
	server.use(
		http.post("*/api/v1/members/me/onboarding", () => {
			attempts += 1;
			return apiError(400, "E400", "요청 값이 올바르지 않습니다.");
		})
	);
	const { user } = renderStep(3);

	await user.click(await screen.findByRole("checkbox", { name: "포토존 촬영" }));
	await user.click(screen.getByRole("button", { name: "POP PICK 시작하기" }));

	const alert = await screen.findByRole("alert");

	expect(alert).toHaveTextContent("동행 유형과 인원수를 고르지 않아 저장하지 못했어요");
	expect(within(alert).queryByRole("button", { name: "다시 시도" })).not.toBeInTheDocument();
	expect(within(alert).getByRole("link", { name: "1단계로" })).toHaveAttribute("href", "/onboarding/1");
	expect(within(alert).getByRole("link", { name: "홈으로" })).toHaveAttribute("href", "/");
	expect(attempts).toBe(1);
});

test("이미 온보딩한 회원의 저장이 400으로 거절되면 다시 시도 없이 홈으로 가는 길만 준다", async () => {
	useOnboardingStore.setState({
		loadStatus: "ready",
		answers: { ...EMPTY_ANSWERS, companionType: "ALONE", partySize: 1 }
	});
	server.use(http.post("*/api/v1/members/me/onboarding", () => apiError(400, "E400", "이미 데이터가 존재합니다.")));
	const { user } = renderStep(3);

	await user.click(await screen.findByRole("checkbox", { name: "포토존 촬영" }));
	await user.click(screen.getByRole("button", { name: "POP PICK 시작하기" }));

	const alert = await screen.findByRole("alert");

	expect(alert).toHaveTextContent("이미 취향을 저장했다면 홈에서 그대로 이용할 수 있어요");
	expect(within(alert).queryByRole("button", { name: "다시 시도" })).not.toBeInTheDocument();
	expect(within(alert).queryByRole("link", { name: "1단계로" })).not.toBeInTheDocument();
	expect(within(alert).getByRole("link", { name: "홈으로" })).toHaveAttribute("href", "/");
});

test("저장 다시 시도를 누르는 동안에도 실패 안내와 다시 시도 버튼이 남고 누름을 막는다", async () => {
	useOnboardingStore.setState({ loadStatus: "ready", answers: { ...EMPTY_ANSWERS, categoryIds: [2] } });
	let attempts = 0;
	let release: () => void = () => {};
	const gate = new Promise<void>((resolve) => {
		release = resolve;
	});
	server.use(
		http.post("*/api/v1/members/me/onboarding", async (): Promise<Response> => {
			attempts += 1;

			if (attempts === 1) {
				return apiError(500, "E500");
			}

			await gate;
			return apiSuccess(null);
		})
	);
	const { user } = renderStep(3);

	await user.click(await screen.findByRole("checkbox", { name: "포토존 촬영" }));
	await user.click(screen.getByRole("button", { name: "POP PICK 시작하기" }));
	await user.click(await screen.findByRole("button", { name: "다시 시도" }));

	const retryButton = screen.getByRole("button", { name: "다시 시도" });

	expect(retryButton).toHaveAttribute("aria-disabled", "true");

	await user.click(retryButton);

	expect(attempts).toBe(2);

	release();

	expect(await screen.findByRole("alertdialog")).toHaveTextContent("환영합니다");
});

test("저장에 성공하면 홈 추천과 플래너 기본값 캐시를 오래된 것으로 표시한다", async () => {
	useOnboardingStore.setState({ loadStatus: "ready", answers: { ...EMPTY_ANSWERS, categoryIds: [2] } });
	const { user, queryClient } = renderStep(3);
	queryClient.setQueryData(["recommendations", "home"], []);
	queryClient.setQueryData(["planner", "form"], {});

	await user.click(await screen.findByRole("checkbox", { name: "포토존 촬영" }));
	await user.click(screen.getByRole("button", { name: "POP PICK 시작하기" }));
	await screen.findByRole("alertdialog");

	expect(queryClient.getQueryState(["recommendations", "home"])?.isInvalidated).toBe(true);
	expect(queryClient.getQueryState(["planner", "form"])?.isInvalidated).toBe(true);
});
