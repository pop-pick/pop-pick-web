export function buildOnboardingStepPath(step: number) {
	return `/onboarding/${String(step)}`;
}

export const ONBOARDING_FIRST_STEP_PATH = buildOnboardingStepPath(1);
