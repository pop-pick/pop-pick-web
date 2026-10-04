import type { QueryClient } from "@tanstack/react-query";
import { waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { expect, test, vi } from "vitest";

import { AuthProvider } from "@/features/auth/components/AuthProvider";
import { useAuthStore } from "@/features/auth/model/useAuthStore";
import { EMPTY_ANSWERS } from "@/features/onboarding/model/answers";
import { useOnboardingStore } from "@/features/onboarding/model/useOnboardingStore";
import { refreshAccessToken } from "@/shared/api/auth-token";
import { useRecentPopupsStore } from "@/shared/model/useRecentPopupsStore";

import { signInAsMember } from "../support/auth";
import { apiError, apiSuccess, server } from "../support/msw";
import { renderWithProviders } from "../support/render";

test("세션 복원이 쿠키 없음으로 끝나도 그사이 로그인으로 받은 액세스 토큰은 지우지 않는다", async () => {
	let release: () => void = () => {};
	const gate = new Promise<void>((resolve) => {
		release = resolve;
	});
	server.use(
		http.post("*/api/auth/refresh", async (): Promise<Response> => {
			await gate;
			return apiError(401, "E1000");
		})
	);

	renderWithProviders(<AuthProvider>화면</AuthProvider>);
	signInAsMember("login-token");
	release();

	await new Promise((resolve) => setTimeout(resolve, 50));

	expect(useAuthStore.getState()).toMatchObject({ status: "authenticated", accessToken: "login-token" });
});

test("로그인한 적 없이 쿠키가 없으면 세션 복원이 비로그인으로 끝난다", async () => {
	server.use(http.post("*/api/auth/refresh", () => apiError(401, "E1000")));

	renderWithProviders(<AuthProvider>화면</AuthProvider>);

	await waitFor(() => {
		expect(useAuthStore.getState().status).toBe("anonymous");
	});
});

test("쿠키가 있으면 세션 복원이 액세스 토큰을 받아 로그인 상태가 된다", async () => {
	server.use(http.post("*/api/auth/refresh", () => apiSuccess({ accessToken: "restored" })));

	renderWithProviders(<AuthProvider>화면</AuthProvider>);

	await waitFor(() => {
		expect(useAuthStore.getState()).toMatchObject({ status: "authenticated", accessToken: "restored" });
	});
});

test.each(["E1002", "E1005", "E1006"])(
	"리프레시 토큰이 %s로 거절되면 연결 실패가 아니라 비로그인으로 끝난다",
	async (errorCode) => {
		server.use(http.post("*/api/auth/refresh", () => apiError(400, errorCode)));

		renderWithProviders(<AuthProvider>화면</AuthProvider>);

		await waitFor(() => {
			expect(useAuthStore.getState().status).toBe("anonymous");
		});
	}
);

test("탭 사이에 재발급이 겹치지 않게 Web Locks 안에서 세션을 복원한다", async () => {
	const request = vi.fn(async (_name: string, handler: () => Promise<boolean>) => handler());
	vi.stubGlobal("navigator", { ...window.navigator, locks: { request } });
	server.use(http.post("*/api/auth/refresh", () => apiSuccess({ accessToken: "restored" })));

	renderWithProviders(<AuthProvider>화면</AuthProvider>);

	await waitFor(() => {
		expect(useAuthStore.getState().status).toBe("authenticated");
	});

	expect(request).toHaveBeenCalledWith("pp-auth-refresh", expect.any(Function));

	vi.unstubAllGlobals();
});

function seedAccountState() {
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
	useOnboardingStore.setState({ loadStatus: "ready", answers: { ...EMPTY_ANSWERS, categoryIds: [2] } });
}

function expectAccountStateCleared(queryClient: QueryClient) {
	expect(useRecentPopupsStore.getState().items).toEqual([]);
	expect(useOnboardingStore.getState().answers).toEqual(EMPTY_ANSWERS);
	expect(queryClient.getQueryCache().findAll({ queryKey: ["bookmarks"] })).toEqual([]);
}

test("로그인한 세션이 만료로 끝나면 최근 본 팝업과 온보딩 답, 회원 쿼리를 비운다", async () => {
	server.use(http.post("*/api/auth/refresh", () => apiError(401, "E1011")));
	signInAsMember();
	const { queryClient } = renderWithProviders(<AuthProvider>화면</AuthProvider>);
	seedAccountState();
	queryClient.setQueryData(["bookmarks", "list"], []);

	await refreshAccessToken();

	await waitFor(() => {
		expect(useAuthStore.getState().status).toBe("anonymous");
	});
	expectAccountStateCleared(queryClient);
});

test("세션이 끝나면 이 페이지에서 복원하지 않은 최근 본 팝업과 온보딩 답의 저장소 값도 지운다", async () => {
	server.use(http.post("*/api/auth/refresh", () => apiError(401, "E1011")));
	signInAsMember();
	renderWithProviders(<AuthProvider>화면</AuthProvider>);
	window.sessionStorage.setItem("pp-recent-popups", JSON.stringify({ state: { items: [{ id: 1 }] }, version: 3 }));
	window.sessionStorage.setItem(
		"pp-onboarding-answers",
		JSON.stringify({ state: { answers: { areaIds: [1] } }, version: 0 })
	);

	await refreshAccessToken();

	await waitFor(() => {
		expect(useAuthStore.getState().status).toBe("anonymous");
	});
	expect(window.sessionStorage.getItem("pp-recent-popups")).toBeNull();
	expect(window.sessionStorage.getItem("pp-onboarding-answers")).toBeNull();
});

test("재발급이 네트워크로 실패했다가 나중에 거절되어도 로그인했던 세션이면 비운다", async () => {
	let attempts = 0;
	server.use(
		http.post("*/api/auth/refresh", (): Response => {
			attempts += 1;
			return attempts === 1 ? HttpResponse.error() : apiError(401, "E1011");
		})
	);
	signInAsMember();
	const { queryClient } = renderWithProviders(<AuthProvider>화면</AuthProvider>);
	seedAccountState();

	await refreshAccessToken();
	await waitFor(() => {
		expect(useAuthStore.getState().status).toBe("unavailable");
	});
	await refreshAccessToken();

	await waitFor(() => {
		expect(useAuthStore.getState().status).toBe("anonymous");
	});
	expectAccountStateCleared(queryClient);
});

test("처음부터 세션이 없던 비회원은 쿠키가 없어도 남아 있던 기록을 지우지 않는다", async () => {
	server.use(http.post("*/api/auth/refresh", () => apiError(401, "E1000")));
	seedAccountState();

	renderWithProviders(<AuthProvider>화면</AuthProvider>);

	await waitFor(() => {
		expect(useAuthStore.getState().status).toBe("anonymous");
	});

	expect(useRecentPopupsStore.getState().items).toHaveLength(1);
	expect(useOnboardingStore.getState().answers.categoryIds).toEqual([2]);
});

test("재발급이 진행되는 동안 로그아웃하면 늦게 온 재발급 성공이 다시 로그인시키지 않는다", async () => {
	let release: () => void = () => {};
	const gate = new Promise<void>((resolve) => {
		release = resolve;
	});
	server.use(
		http.post("*/api/auth/refresh", async (): Promise<Response> => {
			await gate;
			return apiSuccess({ accessToken: "late-token" });
		})
	);
	renderWithProviders(<AuthProvider>화면</AuthProvider>);
	signInAsMember();

	const pending = refreshAccessToken();
	useAuthStore.getState().clearSession();
	release();
	await pending;

	expect(useAuthStore.getState()).toMatchObject({ status: "anonymous", accessToken: null });
});
