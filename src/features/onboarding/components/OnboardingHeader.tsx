import { PageHeader } from "@/shared/components/PageHeader";

import { ONBOARDING_HEADER_TITLE } from "../model/messages";
import { buildPreviousStepPath, ONBOARDING_STEPS, type OnboardingStep } from "../model/steps";

interface OnboardingHeaderProps {
	step: OnboardingStep;
}

export function OnboardingHeader({ step }: OnboardingHeaderProps) {
	const totalSteps = ONBOARDING_STEPS.length;

	return (
		<PageHeader
			title={ONBOARDING_HEADER_TITLE}
			backHref={buildPreviousStepPath(step)}
			backLabel={step === 1 ? "처음 화면으로" : `${String(step - 1)}단계로`}
			isSticky
			trailing={
				<p className="shrink-0 text-b1-16 text-primary">
					<span aria-hidden="true">{`${String(step)}/${String(totalSteps)}`}</span>
					<span className="sr-only">{`${String(totalSteps)}단계 중 ${String(step)}단계`}</span>
				</p>
			}
		/>
	);
}
