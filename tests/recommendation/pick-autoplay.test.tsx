import { screen, waitFor } from "@testing-library/react";
import { expect, test, vi } from "vitest";

import { PickSection } from "@/features/recommendation/components/PickSection";

import { renderWithProviders } from "../support/render";

const RECOMMENDATIONS = [
	"시나모롤 20주년 팝업 하우스",
	"메종 마르지엘라 신제품 쇼룸",
	"무신사 가을 시즌 오프 아울렛"
].map((title, index) => ({
	popup: {
		id: index + 1,
		title,
		category: null,
		areaName: null,
		startDate: null,
		endDate: null,
		reservationType: "UNKNOWN" as const,
		imageUrl: null,
		isBookmarked: false
	},
	reason: `${title} 추천 이유`
}));

const AUTOPLAY_WAIT = { timeout: 4500 };

vi.stubGlobal("matchMedia", (query: string) => ({
	matches: false,
	media: query,
	addEventListener() {},
	removeEventListener() {}
}));

test("회원님의 팝업 PICK을 한 번 끌었다 놓아도 3초 뒤에 다음 카드로 넘어간다", async () => {
	const { user } = renderWithProviders(<PickSection recommendations={RECOMMENDATIONS} />);
	const firstCard = screen.getByRole("link", { name: "시나모롤 20주년 팝업 하우스" });
	const secondToggle = screen.getByRole("button", { name: "메종 마르지엘라 신제품 쇼룸 추천 이유" });

	await user.pointer([
		{ keys: "[MouseLeft>]", target: firstCard, coords: { clientX: 200, clientY: 100 } },
		{ coords: { clientX: 40, clientY: 100 } },
		{ keys: "[/MouseLeft]" }
	]);
	await user.pointer({ target: document.body, coords: { clientX: 0, clientY: 0 } });

	await waitFor(() => expect(secondToggle).toHaveAttribute("aria-expanded", "true"), AUTOPLAY_WAIT);
});

test("화면 밖 카드에 키보드 포커스가 가도 뷰포트 가로 스크롤을 0으로 되돌린다", async () => {
	const { user } = renderWithProviders(<PickSection recommendations={RECOMMENDATIONS} />);
	const viewport = screen.getByRole("list").parentElement as HTMLElement;
	const scrollLefts: number[] = [];
	Object.defineProperty(viewport, "scrollLeft", {
		configurable: true,
		get: () => 0,
		set: (value: number) => scrollLefts.push(value)
	});

	await user.tab();
	await user.tab();

	expect(scrollLefts).toContain(0);
});
