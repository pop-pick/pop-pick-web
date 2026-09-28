import { notFound } from "next/navigation";

import { RequireAuth } from "@/features/auth/components/RequireAuth";
import { OnboardingHeader } from "@/features/onboarding/components/OnboardingHeader";
import { OnboardingStepScreen } from "@/features/onboarding/components/OnboardingStepScreen";
import { parseStep } from "@/features/onboarding/model/steps";
import { buildOnboardingStepPath } from "@/shared/model/onboarding-path";

export default async function OnboardingStepPage({ params }: PageProps<"/onboarding/[step]">) {
	const { step: stepParam } = await params;
	const step = parseStep(stepParam);

	if (step === null) {
		notFound();
	}

	return (
		<>
			<OnboardingHeader step={step} />
			<main className="flex flex-1 flex-col">
				<RequireAuth nextPath={buildOnboardingStepPath(step)}>
					<OnboardingStepScreen step={step} />
				</RequireAuth>
			</main>
		</>
	);
}
