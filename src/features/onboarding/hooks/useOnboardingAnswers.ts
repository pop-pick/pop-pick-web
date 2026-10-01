import { useEffect } from "react";

import { useOnboardingStore } from "../model/useOnboardingStore";

/** zustand persist는 sessionStorage를 열지 못하면 persist 속성을 붙이지 않고 메모리에만 쓴다. 저장을 막은 브라우저에서 rehydrate를 부르면 TypeError가 난다 */
function canPersistAnswers() {
	return Object.hasOwn(useOnboardingStore, "persist");
}

/** 서버 렌더에는 sessionStorage가 없어 첫 렌더를 비워 두고 마운트 뒤에 입력한 답을 불러온다 */
export function useOnboardingAnswers() {
	const answers = useOnboardingStore((state) => state.answers);
	const loadStatus = useOnboardingStore((state) => state.loadStatus);

	useEffect(() => {
		if (useOnboardingStore.getState().loadStatus !== "loading") {
			return;
		}

		if (!canPersistAnswers()) {
			console.warn("[onboarding] sessionStorage를 열지 못해 입력한 답을 이 탭의 메모리에만 둔다");
			useOnboardingStore.setState({ loadStatus: "failed" });
			return;
		}

		void useOnboardingStore.persist.rehydrate();
	}, []);

	return { answers, loadStatus };
}
