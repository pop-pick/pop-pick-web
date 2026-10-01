import { buildOnboardingStepPath } from "@/shared/model/onboarding-path";

export const ONBOARDING_STEPS = [1, 2, 3] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

export function parseStep(value: string) {
	return ONBOARDING_STEPS.find((candidate) => String(candidate) === value) ?? null;
}

export function buildPreviousStepPath(step: OnboardingStep) {
	return step === 1 ? "/" : buildOnboardingStepPath(step - 1);
}
