import Image from "next/image";

import { ONBOARDING_STEP_DESCRIPTIONS, ONBOARDING_STEP_TITLES } from "../model/messages";
import type { OnboardingStep } from "../model/steps";

const ILLUSTRATION_SIZE = 111;

interface OnboardingStepIntroProps {
	step: OnboardingStep;
}

export function OnboardingStepIntro({ step }: OnboardingStepIntroProps) {
	return (
		<div className="flex flex-col items-center px-5 pt-1.75 text-center">
			<Image
				src={`/images/illustrations/onboarding-${String(step)}.svg`}
				alt=""
				width={ILLUSTRATION_SIZE}
				height={ILLUSTRATION_SIZE}
				loading="eager"
			/>
			<h1 className="mt-2 text-h1 leading-8 text-text-1">{ONBOARDING_STEP_TITLES[step]}</h1>
			<p className="mt-3 min-h-10.5 text-b2-14 whitespace-pre-line text-text-4">{ONBOARDING_STEP_DESCRIPTIONS[step]}</p>
		</div>
	);
}
