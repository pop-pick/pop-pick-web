import { screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";

import { LoginScreen } from "@/features/auth/components/LoginScreen";
import { startOAuthLogin } from "@/features/auth/model/oauth-provider";

import { renderWithProviders } from "../support/render";

vi.mock("@/features/auth/model/oauth-provider", () => ({ startOAuthLogin: vi.fn() }));

test("로그인 주소의 next가 같은 출처 경로면 쿼리까지 그대로 로그인 시작에 넘긴다", async () => {
	const { user } = renderWithProviders(<LoginScreen />, {
		url: `/login?next=${encodeURIComponent("/planner/new?areaId=2&note=a")}`
	});

	await user.click(screen.getByRole("button", { name: "카카오 계정으로 로그인" }));

	expect(startOAuthLogin).toHaveBeenLastCalledWith("KAKAO", "/planner/new?areaId=2&note=a");
});

test.each([["/login?next=//evil.example"], ["/login"]])("%s는 돌아갈 곳 없이 로그인을 시작한다", async (url) => {
	const { user } = renderWithProviders(<LoginScreen />, { url });

	await user.click(screen.getByRole("button", { name: "Google 계정으로 로그인" }));

	expect(startOAuthLogin).toHaveBeenLastCalledWith("GOOGLE", null);
});
