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
		region: null,
		startDate: null,
		endDate: null,
		reservationType: "UNKNOWN" as const,
		imageUrl: null,
		isBookmarked: false
	},
	reason: `${title} 추천 이유`,
	badge: null
}));

const AUTOPLAY_WAIT = { timeout: 4500 };

vi.stubGlobal("matchMedia", (query: string) => ({
	matches: false,
	media: query,
	addEventListener() {},
	removeEventListener() {}
}));

test("회원님의 팝업 PICK을 한 번 끌었다 놓아도 3초 뒤에 다음 카드로 넘어간다", async () => {
	const { user } = renderWithProviders(<PickSection nickname={null} recommendations={RECOMMENDATIONS} />);
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
