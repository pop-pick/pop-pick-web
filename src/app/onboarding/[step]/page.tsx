import { notFound } from "next/navigation";

import { RequireAuth } from "@/features/auth/components/RequireAuth";
import { OnboardingHeader } from "@/features/onboarding/components/OnboardingHeader";
import { OnboardingStepIntro } from "@/features/onboarding/components/OnboardingStepIntro";
import { OnboardingStepScreen } from "@/features/onboarding/components/OnboardingStepScreen";
import { OnboardingStepSkeleton } from "@/features/onboarding/components/OnboardingStepSkeleton";
import { AUTH_CHECKING_MESSAGE } from "@/features/onboarding/model/messages";
import { ONBOARDING_STEPS, parseStep } from "@/features/onboarding/model/steps";
import { buildOnboardingStepPath } from "@/shared/model/onboarding-path";

export function generateStaticParams() {
	return ONBOARDING_STEPS.map((step) => ({ step: String(step) }));
}

export default async function OnboardingStepPage({ params }: PageProps<"/onboarding/[step]">) {
	const { step: stepParam } = await params;
	const step = parseStep(stepParam);

	if (step === null) {
		notFound();
	}

	const authFallback = (
		<div className="flex flex-1 flex-col">
			<OnboardingStepIntro step={step} />
			<OnboardingStepSkeleton step={step} label={AUTH_CHECKING_MESSAGE} />
		</div>
	);

	return (
		<>
			<OnboardingHeader step={step} />
			<main className="flex flex-1 flex-col">
				<RequireAuth nextPath={buildOnboardingStepPath(step)} fallback={authFallback}>
					<OnboardingStepScreen step={step} />
				</RequireAuth>
			</main>
		</>
	);
}
