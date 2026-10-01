import { useMutation } from "@tanstack/react-query";

import { saveOnboarding } from "../api/save-onboarding";
import { useOnboardingStore } from "../model/useOnboardingStore";

export function useSaveOnboarding() {
	return useMutation({
		mutationFn: saveOnboarding,
		onSuccess: () => {
			useOnboardingStore.getState().resetAnswers();
		},
		onError: (error) => {
			console.warn("[onboarding] 취향을 저장하지 못했다", error);
		}
	});
}
