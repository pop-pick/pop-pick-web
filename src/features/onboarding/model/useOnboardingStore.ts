import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { EMPTY_ANSWERS, EMPTY_STEP_ANSWERS, type OnboardingAnswers, type OnboardingStepAnswers } from "./answers";
import type { OnboardingStep } from "./steps";

const STORAGE_KEY = "pp-onboarding-answers";

export type OnboardingAnswersLoadStatus = "loading" | "ready" | "failed";

interface OnboardingState {
	answers: OnboardingAnswers;
	loadStatus: OnboardingAnswersLoadStatus;
	setStepAnswers: <S extends OnboardingStep>(step: S, patch: OnboardingStepAnswers[S]) => void;
	clearStepAnswers: (step: OnboardingStep) => void;
	resetAnswers: () => void;
}

/** 복원 전에 쓰면 persist가 빈 답 위에 쓴 값을 저장해 이전 단계의 답을 지운다. 복원이 끝나기 전의 쓰기는 호출하는 쪽의 결함이다 */
function verifyLoaded(loadStatus: OnboardingAnswersLoadStatus) {
	if (loadStatus === "loading") {
		throw new Error("[onboarding] 입력한 답을 불러오기 전에 고치려 했다");
	}
}

/** 탭을 닫으면 지워지도록 sessionStorage에 둔다. 같은 브라우저에서 다른 계정으로 로그인했을 때 이전 답이 보이지 않게 하려는 것이다 */
export const useOnboardingStore = create<OnboardingState>()(
	persist(
		(set, get) => ({
			answers: EMPTY_ANSWERS,
			loadStatus: "loading",
			setStepAnswers: (_step, patch) => {
				const { answers, loadStatus } = get();
				verifyLoaded(loadStatus);

				set({ answers: { ...answers, ...patch } });
			},
			clearStepAnswers: (step) => {
				const { answers, loadStatus } = get();
				verifyLoaded(loadStatus);

				set({ answers: { ...answers, ...EMPTY_STEP_ANSWERS[step] } });
			},
			resetAnswers: () => {
				verifyLoaded(get().loadStatus);

				set({ answers: EMPTY_ANSWERS });
			}
		}),
		{
			name: STORAGE_KEY,
			storage: createJSONStorage(() => sessionStorage),
			partialize: (state) => ({ answers: state.answers }),
			skipHydration: true,
			onRehydrateStorage: () => (_state, error) => {
				if (error !== undefined) {
					console.warn("[onboarding] 입력한 답을 불러오지 못했다", error);
					useOnboardingStore.setState({ loadStatus: "failed" });
					return;
				}

				useOnboardingStore.setState({ loadStatus: "ready" });
			}
		}
	)
);
