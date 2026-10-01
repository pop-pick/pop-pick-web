import { screen } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";

import { OAuthCallback } from "@/features/auth/components/OAuthCallback";
import { storeNextPath } from "@/features/auth/model/next-path";

import { renderWithProviders } from "../support/render";

afterEach(() => {
	window.sessionStorage.clear();
});

test("온보딩으로 가려던 로그인이 실패하면 다시 로그인이 같은 목적지를 달고 로그인 화면으로 간다", () => {
	storeNextPath("/onboarding/1");

	renderWithProviders(<OAuthCallback provider="KAKAO" />, { url: "/auth/kakao/callback?error=access_denied" });

	expect(screen.getByRole("link", { name: "다시 로그인" })).toHaveAttribute(
		"href",
		`/login?next=${encodeURIComponent("/onboarding/1")}`
	);
});

test("목적지 없이 시작한 로그인이 실패하면 다시 로그인이 로그인 화면으로만 간다", () => {
	renderWithProviders(<OAuthCallback provider="KAKAO" />, { url: "/auth/kakao/callback" });

	expect(screen.getByRole("link", { name: "다시 로그인" })).toHaveAttribute("href", "/login");
});
