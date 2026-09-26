export const ONBOARDING_STEPS = [1, 2, 3] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

export function parseStep(value: string) {
	const step = Number(value);
	return ONBOARDING_STEPS.find((candidate) => candidate === step) ?? null;
}

export function getPreviousPath(step: OnboardingStep) {
	return step === 1 ? "/" : `/onboarding/${String(step - 1)}`;
}
