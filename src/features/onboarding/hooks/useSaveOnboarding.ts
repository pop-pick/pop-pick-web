import { useMutation, useQueryClient } from "@tanstack/react-query";

import { saveOnboarding } from "../api/save-onboarding";
import { useOnboardingStore } from "../model/useOnboardingStore";

export function useSaveOnboarding() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: saveOnboarding,
		onSuccess: () => {
			useOnboardingStore.getState().resetAnswers();
			void queryClient.invalidateQueries({ queryKey: ["recommendations", "home"] });
			void queryClient.invalidateQueries({ queryKey: ["planner", "form"] });
		},
		onError: (error) => {
			console.warn("[onboarding] 취향을 저장하지 못했다", error);
		}
	});
}
