import { screen, waitFor, within } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { expect, test, vi } from "vitest";

import MyPage from "@/app/my/page";
import { AuthProvider } from "@/features/auth/components/AuthProvider";
import { useAuthStore } from "@/features/auth/model/useAuthStore";
import { useRecentPopupsStore } from "@/shared/model/useRecentPopupsStore";

import { signInAsMember, signOutAsGuest } from "../support/auth";
import { apiSuccess, server } from "../support/msw";
import { renderWithProviders } from "../support/render";

function serveEmptyWishes() {
	server.use(http.get("/api/v1/wishes", () => apiSuccess({ content: [], hasNext: false, nextCursor: null })));
}

test("비회원이 마이페이지를 열면 로그인 화면으로 보내고 돌아올 경로로 /my를 남긴다", async () => {
	signOutAsGuest();
	const { router } = renderWithProviders(<MyPage />, { url: "/my" });

	await waitFor(() => {
		expect(router).toMatchObject({ pathname: "/login", query: { next: "/my" } });
	});
	expect(screen.queryByRole("tab", { name: "찜한 팝업" })).not.toBeInTheDocument();
});

test("회원 마이페이지는 찜한 팝업과 최근 본 팝업 탭을 두고 기본은 찜한 팝업이다", async () => {
	signInAsMember();
	serveEmptyWishes();
	renderWithProviders(<MyPage />, { url: "/my" });

	expect(await screen.findByRole("tab", { name: "찜한 팝업", selected: true })).toBeInTheDocument();
	expect(screen.getByRole("tab", { name: "최근 본 팝업", selected: false })).toBeInTheDocument();
});

test("로그아웃 행은 확인 알럿을 띄우고 취소하면 로그아웃하지 않는다", async () => {
	signInAsMember();
	serveEmptyWishes();
	const logoutRequest = vi.fn();
	server.use(
		http.delete("/api/auth/session", () => {
			logoutRequest();
			return new HttpResponse(null, { status: 204 });
		})
	);
	const { user } = renderWithProviders(<MyPage />, { url: "/my" });

	await user.click(await screen.findByRole("button", { name: "로그아웃" }));

	const dialog = await screen.findByRole("alertdialog");

	expect(within(dialog).getByText("로그아웃 하시겠습니까?")).toBeInTheDocument();

	await user.click(within(dialog).getByRole("button", { name: "취소" }));

	await waitFor(() => {
		expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
	});
	expect(logoutRequest).not.toHaveBeenCalled();
	expect(screen.getByRole("tab", { name: "찜한 팝업" })).toBeInTheDocument();
});

test("로그아웃을 확인하면 세션을 지우고 최근 본 팝업 기록과 받아 둔 쿼리를 비운 채 홈으로 간다", async () => {
	signInAsMember();
	serveEmptyWishes();
	server.use(
		http.post("/api/auth/refresh", () => apiSuccess({ accessToken: "test-access-token" })),
		http.delete("/api/auth/session", () => new HttpResponse(null, { status: 204 }))
	);
	const { user, router, queryClient } = renderWithProviders(
		<AuthProvider>
			<MyPage />
		</AuthProvider>,
		{ url: "/my" }
	);

	useRecentPopupsStore.setState({
		loadStatus: "ready",
		items: [
			{
				id: 7,
				title: "성수 팝업",
				category: null,
				areaName: null,
				startDate: null,
				endDate: null,
				reservationType: "UNKNOWN",
				imageUrl: null
			}
		]
	});

	await user.click(await screen.findByRole("button", { name: "로그아웃" }));
	await user.click(within(await screen.findByRole("alertdialog")).getByRole("button", { name: "확인" }));

	await waitFor(() => {
		expect(router).toMatchObject({ pathname: "/" });
	});
	expect(useAuthStore.getState()).toMatchObject({ status: "anonymous", accessToken: null });
	expect(useRecentPopupsStore.getState().items).toEqual([]);
	expect(queryClient.getQueryCache().findAll({ queryKey: ["bookmarks"] })).toEqual([]);
});

test("FAQ와 이용약관 행은 준비 중이라 눌러도 이동하지 않는다", async () => {
	signInAsMember();
	serveEmptyWishes();
	const { user, router } = renderWithProviders(<MyPage />, { url: "/my" });

	const faq = await screen.findByRole("button", { name: /FAQ/ });

	await user.click(faq);

	expect(faq).toHaveAttribute("aria-disabled", "true");
	expect(router).toMatchObject({ pathname: "/my" });
});
