import { screen, within } from "@testing-library/react";
import { http } from "msw";
import { expect, test, vi } from "vitest";

import { HomePickSection } from "@/features/recommendation/components/HomePickSection";
import { PopularSection } from "@/features/recommendation/components/PopularSection";
import type { PopupListItemResponse } from "@/shared/model/popup";

import { signInAsMember } from "../support/auth";
import { apiError, apiSuccess, server } from "../support/msw";
import { renderWithProviders } from "../support/render";

vi.stubGlobal("matchMedia", (query: string) => ({
	matches: false,
	media: query,
	addEventListener() {},
	removeEventListener() {}
}));

const TITLES = [
	"시오팡야 팝업스토어",
	"오아 팝업스토어",
	"오아 소형가전 팝업스토어",
	"성수 굿즈 마켓",
	"홍대 아트 위크"
];

function buildListItem(title: string, index: number) {
	const item: PopupListItemResponse = {
		popupId: 100 + index,
		imageUrl: null,
		interestCategoryId: index === 0 ? null : 3,
		areaName: null,
		title,
		endDate: null,
		reservationType: "UNKNOWN",
		wished: false
	};

	return item;
}

function respondWithPopups(titles: string[]) {
	return apiSuccess({ content: titles.map(buildListItem), hasNext: false, nextCursor: null });
}

async function findPopularLinks() {
	return within(await screen.findByRole("list")).findAllByRole("link");
}

test("비회원 홈의 인기 팝업은 응답한 셋을 순서대로 보이고 행을 누르면 그 팝업 상세로 간다", async () => {
	server.use(http.get("/api/v1/popups", () => respondWithPopups(TITLES.slice(0, 3))));
	const { user, router } = renderWithProviders(<PopularSection />);

	const links = await findPopularLinks();

	expect(links.map((link) => link.textContent)).toEqual(TITLES.slice(0, 3));

	await user.click(screen.getByRole("link", { name: "오아 팝업스토어" }));

	expect(router).toMatchObject({ pathname: "/popups/101" });
});

test("인기 팝업을 불러오지 못하면 다시 시도로 회복한다", async () => {
	server.use(
		http.get("/api/v1/popups", () => apiError(500, "E0000"), { once: true }),
		http.get("/api/v1/popups", () => respondWithPopups(TITLES.slice(0, 3)))
	);
	const { user } = renderWithProviders(<PopularSection />);

	await user.click(await screen.findByRole("button", { name: "다시 시도" }));

	expect(await findPopularLinks()).toHaveLength(3);
});

test("회원 홈의 팝업 PICK은 응답한 팝업 중 셋을 카드로 보인다", async () => {
	signInAsMember();
	server.use(http.get("/api/v1/popups", () => respondWithPopups(TITLES)));
	renderWithProviders(<HomePickSection />);

	const cards = await screen.findAllByRole("article");
	const cardTitles = cards.map((card) => within(card).getByRole("link").textContent);

	expect(cardTitles).toHaveLength(3);
	expect(new Set(cardTitles).size).toBe(3);
	expect(TITLES).toEqual(expect.arrayContaining(cardTitles));
});

test("회원 홈의 팝업 PICK을 불러오지 못하면 다시 시도로 회복한다", async () => {
	signInAsMember();
	server.use(
		http.get("/api/v1/popups", () => apiError(500, "E0000"), { once: true }),
		http.get("/api/v1/popups", () => respondWithPopups(TITLES))
	);
	const { user } = renderWithProviders(<HomePickSection />);

	await user.click(await screen.findByRole("button", { name: "다시 시도" }));

	expect(await screen.findAllByRole("article")).toHaveLength(3);
});
