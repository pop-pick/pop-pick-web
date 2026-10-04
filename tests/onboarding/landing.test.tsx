import { screen, waitFor } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";

import { LandingDialog } from "@/features/onboarding/components/LandingDialog";

import { renderWithProviders } from "../support/render";

const LOGIN_HREF = "/login?next=%2Fonboarding%2F1";

afterEach(() => {
	window.sessionStorage.clear();
});

test("TC-001 첫 진입 모달에 서비스 소개와 나에게 맞는 팝업 찾기, 둘러보기가 보인다", () => {
	renderWithProviders(<LandingDialog loginHref={LOGIN_HREF} />);

	const dialog = screen.getByRole("dialog");

	expect(dialog).toHaveAccessibleName("서울 팝업 지도");
	expect(dialog).toHaveTextContent("오늘 갈 팝업 PICK 해드릴게요!");
	expect(screen.getByRole("link", { name: "나에게 맞는 팝업 찾기" })).toHaveAttribute("href", LOGIN_HREF);
	expect(screen.getByRole("button", { name: "둘러보기" })).toBeInTheDocument();
});

test("TC-002 둘러보기를 누르면 모달이 닫히고 같은 탭에서는 다시 열리지 않는다", async () => {
	const { user, unmount } = renderWithProviders(<LandingDialog loginHref={LOGIN_HREF} />);

	await user.click(screen.getByRole("button", { name: "둘러보기" }));

	await waitFor(() => {
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
	});

	unmount();
	renderWithProviders(<LandingDialog loginHref={LOGIN_HREF} />);

	expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});
