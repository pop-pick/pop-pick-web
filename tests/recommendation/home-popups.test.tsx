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

const TITLES = ["시오팡야 팝업스토어", "오아 팝업스토어", "성수 굿즈 마켓"];

function buildListItem(title: string, index: number) {
	const item: PopupListItemResponse = {
		popupId: 100 + index,
		imageUrl: null,
		interestCategoryId: index === 0 ? null : 3,
		areaName: index === 1 ? "성수" : null,
		title,
		endDate: null,
		reservationType: index === 1 ? "RESERVATION" : "UNKNOWN",
		wished: false
	};

	return item;
}

function respondWithPopups(titles: string[]) {
	return apiSuccess(titles.map(buildListItem));
}

async function findPopularLinks() {
	return within(await screen.findByRole("list")).findAllByRole("link");
}

test("비회원 홈의 인기 팝업은 인기 API 응답을 순서대로 보이고 토큰 없이 부르며 행을 누르면 그 팝업 상세로 간다", async () => {
	let authorization: string | null = "unset";
	server.use(
		http.get("/api/v1/popups/popular", ({ request }) => {
			authorization = request.headers.get("authorization");
			return respondWithPopups(TITLES);
		})
	);
	const { user, router } = renderWithProviders(<PopularSection />);

	const links = await findPopularLinks();

	expect(authorization).toBeNull();
	expect(links.map((link) => link.querySelector("p")?.textContent)).toEqual(TITLES);

	await user.click(screen.getByRole("link", { name: /오아 팝업스토어/ }));

	expect(router).toMatchObject({ pathname: "/popups/101" });
});

test("인기 팝업 행은 지역 이름과 예약 구분을 보인다", async () => {
	server.use(http.get("/api/v1/popups/popular", () => respondWithPopups(TITLES)));
	renderWithProviders(<PopularSection />);

	const row = (await screen.findByRole("link", { name: /오아 팝업스토어/ })).textContent;

	expect(row).toContain("성수");
	expect(row).toContain("예약필요");
});

test("회원 홈의 인기 팝업도 토큰 없이 부른다", async () => {
	signInAsMember("member-token");
	let authorization: string | null = "unset";
	server.use(
		http.get("/api/v1/popups/popular", ({ request }) => {
			authorization = request.headers.get("authorization");
			return respondWithPopups(TITLES);
		})
	);
	renderWithProviders(<PopularSection />);

	await findPopularLinks();

	expect(authorization).toBeNull();
});

test("인기 팝업이 없으면 안내를 보인다", async () => {
	server.use(http.get("/api/v1/popups/popular", () => respondWithPopups([])));
	renderWithProviders(<PopularSection />);

	expect(await screen.findByText("아직 등록된 팝업이 없어요.")).toBeInTheDocument();
});

test("인기 팝업을 불러오지 못하면 다시 시도로 회복한다", async () => {
	server.use(
		http.get("/api/v1/popups/popular", () => apiError(500, "E0000"), { once: true }),
		http.get("/api/v1/popups/popular", () => respondWithPopups(TITLES))
	);
	const { user } = renderWithProviders(<PopularSection />);

	await user.click(await screen.findByRole("button", { name: "다시 시도" }));

	expect(await findPopularLinks()).toHaveLength(3);
});

test("회원 홈의 팝업 PICK은 추천 API 응답을 순서대로 카드로 보이고 토큰을 실어 부른다", async () => {
	signInAsMember("member-token");
	let authorization: string | null = null;
	server.use(
		http.get("/api/v1/popups/recommended", ({ request }) => {
			authorization = request.headers.get("authorization");
			return respondWithPopups(TITLES);
		})
	);
	renderWithProviders(<HomePickSection />);

	const cards = await screen.findAllByRole("article");

	expect(authorization).toBe("Bearer member-token");
	expect(cards.map((card) => within(card).getByRole("link").textContent)).toEqual(TITLES);
	expect(screen.getByText("성수")).toBeInTheDocument();
});

test("회원 홈의 팝업 PICK이 비면 안내를 보인다", async () => {
	signInAsMember();
	server.use(http.get("/api/v1/popups/recommended", () => respondWithPopups([])));
	renderWithProviders(<HomePickSection />);

	expect(await screen.findByText("지금 추천할 팝업이 없어요.")).toBeInTheDocument();
});

test("회원 홈의 팝업 PICK을 불러오지 못하면 다시 시도로 회복한다", async () => {
	signInAsMember();
	server.use(
		http.get("/api/v1/popups/recommended", () => apiError(500, "E0000"), { once: true }),
		http.get("/api/v1/popups/recommended", () => respondWithPopups(TITLES))
	);
	const { user } = renderWithProviders(<HomePickSection />);

	await user.click(await screen.findByRole("button", { name: "다시 시도" }));

	expect(await screen.findAllByRole("article")).toHaveLength(3);
});

test("인기 팝업의 전체보기는 탐색 목록으로 간다", async () => {
	server.use(http.get("/api/v1/popups/popular", () => respondWithPopups(TITLES)));
	const { user, router } = renderWithProviders(<PopularSection />);

	await user.click(await screen.findByRole("link", { name: "인기 팝업 전체보기" }));

	expect(router).toMatchObject({ pathname: "/explore", query: { view: "list" } });
});
