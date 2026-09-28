"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { PLANNER_PATH } from "@/shared/model/planner-path";

const BACK_GUARD_KEY = "coursePlannerBackGuard";

function isBackGuardState(state: unknown) {
	return typeof state === "object" && state !== null && BACK_GUARD_KEY in state;
}

/**
 * 뒤로 가기로 이 화면을 떠나면 직전 기록 대신 플래너 홈으로 보낸다.
 * 같은 주소의 기록을 하나 더 쌓아 뒤로 가기가 이 화면 안에서 일어나게 한다. 다른 주소로 바로 돌아가면
 * Next 라우터의 popstate 리스너가 먼저 불리고 React 19가 그 전환을 동기로 그려서 이 화면의 리스너가 불리기 전에 빠진다
 */
export function useBackToPlanner() {
	const router = useRouter();

	useEffect(() => {
		if (!isBackGuardState(window.history.state)) {
			window.history.pushState({ [BACK_GUARD_KEY]: true }, "", window.location.href);
		}

		const handlePopState = (event: PopStateEvent) => {
			if (!isBackGuardState(event.state)) {
				router.replace(PLANNER_PATH);
			}
		};

		window.addEventListener("popstate", handlePopState);

		return () => {
			window.removeEventListener("popstate", handlePopState);
		};
	}, [router]);
}
