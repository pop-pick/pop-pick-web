export const ONBOARDING_STEPS = [1, 2, 3] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

export function parseStep(value: string) {
	const step = Number(value);
	return ONBOARDING_STEPS.find((candidate) => candidate === step) ?? null;
}

/**
 * 첫 단계의 이전은 랜딩이다. 온보딩에 로그인을 거쳐 오므로 뒤로 가면 로그인 화면이 아니라 랜딩이어야 한다.
 * 히스토리가 아니라 단계로 계산해 링크로 바로 들어와도 같은 곳으로 간다.
 */
export function getPreviousPath(step: OnboardingStep) {
	return step === 1 ? "/" : `/onboarding/${String(step - 1)}`;
}
