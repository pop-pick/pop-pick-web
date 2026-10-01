import { Skeleton } from "@/shared/ui/Skeleton";

import type { OnboardingStep } from "../model/steps";

const SECTION_HEIGHT_CLASSES: Record<OnboardingStep, readonly string[]> = {
	1: ["h-35", "h-35"],
	2: ["h-62.5", "h-48.75"],
	3: ["h-35", "h-52"]
};

interface OnboardingStepSkeletonProps {
	step: OnboardingStep;
	label: string;
}

export function OnboardingStepSkeleton({ step, label }: OnboardingStepSkeletonProps) {
	return (
		<div role="status" className="flex flex-col gap-10 px-5 pt-10">
			<span className="sr-only">{label}</span>
			{SECTION_HEIGHT_CLASSES[step].map((heightClass, index) => (
				<Skeleton key={index} className={heightClass} />
			))}
		</div>
	);
}
