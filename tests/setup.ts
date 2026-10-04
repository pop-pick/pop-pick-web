import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import mockRouter from "next-router-mock";
import { createElement } from "react";
import { afterAll, afterEach, beforeAll, vi } from "vitest";

import { useAuthStore } from "@/features/auth/model/useAuthStore";
import { useRecentPopupsStore } from "@/shared/model/useRecentPopupsStore";

import { server } from "./support/msw";

vi.mock("next/navigation", async (importOriginal) => ({
	...(await importOriginal<typeof import("next/navigation")>()),
	...(await import("next-router-mock/navigation"))
}));

vi.mock("next/link", () => import("./support/next-link"));

// 카카오맵은 외부 SDK 스크립트를 부른다. 네트워크를 MSW로 막는 것과 같은 층에서 지도 대신 이름만 가진 요소를 그린다
vi.mock("@/shared/lib/kakao-map/KakaoMap", () => ({
	KakaoMap: ({ label }: { label: string }) => createElement("div", { role: "img", "aria-label": label })
}));

// jsdom에 없는 브라우저 API다. 레이아웃이 없으니 관찰 대상은 늘 화면 안에 있다고 본다
class ResizeObserverStub {
	observe() {}
	unobserve() {}
	disconnect() {}
}

class IntersectionObserverStub {
	constructor(private readonly callback: IntersectionObserverCallback) {}
	observe(target: Element) {
		this.callback([{ target, isIntersecting: true } as IntersectionObserverEntry], this as never);
	}
	unobserve() {}
	disconnect() {}
}

vi.stubGlobal("ResizeObserver", ResizeObserverStub);
vi.stubGlobal("IntersectionObserver", IntersectionObserverStub);

Element.prototype.scrollIntoView = function scrollIntoView() {};

HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
	this.open = true;
};

HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
	this.open = false;
	this.dispatchEvent(new Event("close"));
};

// Next는 history.pushState와 replaceState를 라우터와 맞춘다. next-router-mock은 그러지 않아 같은 일을 여기서 한다
const nativeReplaceState = window.history.replaceState.bind(window.history);
const nativePushState = window.history.pushState.bind(window.history);

mockRouter.events.on("routeChangeComplete", (url: string) => {
	nativeReplaceState(window.history.state, "", url);
});

window.history.replaceState = (data: unknown, unused: string, url?: string | URL | null) => {
	nativeReplaceState(data, unused, url);
	mockRouter.setCurrentUrl(`${window.location.pathname}${window.location.search}`);
};

window.history.pushState = (data: unknown, unused: string, url?: string | URL | null) => {
	nativePushState(data, unused, url);
	mockRouter.setCurrentUrl(`${window.location.pathname}${window.location.search}`);
};

beforeAll(() => {
	server.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
	cleanup();
	server.resetHandlers();
	useAuthStore.setState(useAuthStore.getInitialState(), true);
	useRecentPopupsStore.setState({ items: [], loadStatus: "loading" });
	sessionStorage.clear();
	mockRouter.setCurrentUrl("/");
	vi.useRealTimers();
});

afterAll(() => {
	server.close();
});
