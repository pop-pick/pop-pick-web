import { screen } from "@testing-library/react";
import { expect, test } from "vitest";

import { TasteBanner } from "@/features/recommendation/components/TasteBanner";

import { renderWithProviders } from "../support/render";

test("회원 취향 배너의 버튼은 코스 조건 입력으로 간다", () => {
	renderWithProviders(<TasteBanner audience="member" />);

	expect(screen.getByRole("link", { name: "AI POP PICK 시작하기" })).toHaveAttribute("href", "/planner/new");
});

test("비회원 취향 배너의 버튼은 온보딩 첫 단계로 간다", () => {
	renderWithProviders(<TasteBanner audience="guest" />);

	expect(screen.getByRole("link", { name: "나에게 맞는 팝업 찾기" })).toHaveAttribute("href", "/onboarding/1");
});
