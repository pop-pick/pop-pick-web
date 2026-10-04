import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { subscribeSessionEnded } from "@/shared/api/auth-token";
import { ACCOUNT_STORAGE_KEYS } from "@/shared/model/account-storage";

import { EMPTY_ANSWERS, EMPTY_STEP_ANSWERS, type OnboardingAnswers, type OnboardingStepAnswers } from "./answers";
import type { OnboardingStep } from "./steps";

const STORAGE_KEY = ACCOUNT_STORAGE_KEYS.onboardingAnswers;

export type OnboardingAnswersLoadStatus = "loading" | "ready" | "failed";

interface OnboardingState {
	answers: OnboardingAnswers;
	loadStatus: OnboardingAnswersLoadStatus;
	setStepAnswers: <S extends OnboardingStep>(step: S, patch: OnboardingStepAnswers[S]) => void;
	clearStepAnswers: (step: OnboardingStep) => void;
	resetAnswers: () => void;
}

/** 복원 전에 쓰면 persist가 빈 답 위에 쓴 값을 저장해 이전 단계의 답을 지운다. 복원이 끝나기 전의 쓰기는 호출하는 쪽의 결함이다 */
function verifyAnswersLoaded(loadStatus: OnboardingAnswersLoadStatus) {
	if (loadStatus === "loading") {
		throw new Error("[onboarding] 입력한 답을 불러오기 전에 고치려 했다");
	}
}

/** 탭을 닫으면 지워지도록 sessionStorage에 둔다 */
export const useOnboardingStore = create<OnboardingState>()(
	persist(
		(set, get) => ({
			answers: EMPTY_ANSWERS,
			loadStatus: "loading",
			setStepAnswers: (_step, patch) => {
				const { answers, loadStatus } = get();
				verifyAnswersLoaded(loadStatus);

				set({ answers: { ...answers, ...patch } });
			},
			clearStepAnswers: (step) => {
				const { answers, loadStatus } = get();
				verifyAnswersLoaded(loadStatus);

				set({ answers: { ...answers, ...EMPTY_STEP_ANSWERS[step] } });
			},
			resetAnswers: () => {
				verifyAnswersLoaded(get().loadStatus);

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

/** 복원 전에도 비워야 이전 계정의 답이 저장소에 남지 않아서 verifyAnswersLoaded를 거치지 않고 직접 쓴다 */
subscribeSessionEnded(() => {
	useOnboardingStore.setState({ answers: EMPTY_ANSWERS });
});
