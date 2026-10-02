import { screen, waitFor } from "@testing-library/react";
import { expect, test } from "vitest";

import { BottomTabBar } from "@/shared/components/BottomTabBar";
import { buildLoginPath } from "@/shared/model/login-path";

import { renderWithProviders } from "../support/render";

const GUEST_LOGIN_HREFS = { "/planner": buildLoginPath("/planner"), "/my": buildLoginPath("/my") };

function getCurrentTabNames() {
	return screen
		.getAllByRole("link")
		.filter((link) => link.getAttribute("aria-current") === "page")
		.map((link) => link.textContent);
}

test("TC-026 탭을 누르면 그 메뉴로 이동하고 현재 메뉴만 활성 표시가 된다", async () => {
	const { user, router } = renderWithProviders(<BottomTabBar />);

	expect(getCurrentTabNames()).toEqual(["홈"]);

	await user.click(screen.getByRole("link", { name: "탐색" }));

	expect(router).toMatchObject({ pathname: "/explore" });
	expect(getCurrentTabNames()).toEqual(["탐색"]);

	await user.click(screen.getByRole("link", { name: "플래너" }));

	expect(router).toMatchObject({ pathname: "/planner" });
	expect(getCurrentTabNames()).toEqual(["플래너"]);

	await user.click(screen.getByRole("link", { name: "마이" }));

	expect(router).toMatchObject({ pathname: "/my" });
	expect(getCurrentTabNames()).toEqual(["마이"]);

	await user.click(screen.getByRole("link", { name: "홈" }));

	expect(router).toMatchObject({ pathname: "/" });
	expect(getCurrentTabNames()).toEqual(["홈"]);
});

test("TC-026 하위 화면에서도 그 화면이 속한 메뉴가 활성 표시가 된다", () => {
	renderWithProviders(<BottomTabBar />, { url: "/explore/popups/1" });

	expect(getCurrentTabNames()).toEqual(["탐색"]);
});

test("TC-026 비회원이 플래너를 누르면 이동하지 않고 로그인 알럿이 뜬다. 닫으면 그대로이고 로그인 하러가기는 로그인으로 보낸다", async () => {
	const { user, router } = renderWithProviders(<BottomTabBar loginHrefByTab={GUEST_LOGIN_HREFS} />);

	await user.click(screen.getByRole("link", { name: "플래너" }));

	expect(router).toMatchObject({ pathname: "/" });
	expect(await screen.findByRole("alertdialog")).toBeInTheDocument();

	await user.click(screen.getByRole("button", { name: "닫기" }));

	await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
	expect(router).toMatchObject({ pathname: "/" });

	await user.click(screen.getByRole("link", { name: "마이" }));
	await user.click(await screen.findByRole("button", { name: "로그인 하러가기" }));

	expect(router).toMatchObject({ pathname: "/login", query: { next: "/my" } });
});

test("TC-026 코스 조건 입력과 로그인 화면에서는 탭바를 그리지 않는다", () => {
	renderWithProviders(<BottomTabBar />, { url: "/planner/new" });

	expect(screen.queryByRole("navigation", { name: "주요 화면" })).not.toBeInTheDocument();
});
