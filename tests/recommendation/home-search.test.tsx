import { screen } from "@testing-library/react";
import { expect, test } from "vitest";

import { HomeSearch } from "@/features/recommendation/components/HomeSearch";

import { renderWithProviders } from "../support/render";

test("홈에서 검색어를 넣고 Enter를 누르면 그 검색어로 탐색 목록에 간다", async () => {
	const { user, router } = renderWithProviders(<HomeSearch />);

	await user.type(screen.getByRole("searchbox", { name: "팝업 검색" }), "  성수 팝업  {Enter}");

	expect(router).toMatchObject({ pathname: "/explore", query: { view: "list", q: "성수 팝업" } });
});
