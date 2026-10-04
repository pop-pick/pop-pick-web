import { tv } from "@/shared/lib/tv";
import { Skeleton } from "@/shared/ui/Skeleton";

import type { OnboardingStep } from "../model/steps";

const skeletonVariants = tv({
	slots: { first: "h-35", second: "h-35" },
	variants: {
		step: {
			1: {},
			2: { first: "h-62.5", second: "h-48.75" },
			3: { second: "h-52" }
		}
	}
});

interface OnboardingStepSkeletonProps {
	step: OnboardingStep;
	label: string;
}

export function OnboardingStepSkeleton({ step, label }: OnboardingStepSkeletonProps) {
	const styles = skeletonVariants({ step });

	return (
		<div role="status" className="flex flex-col gap-10 px-5 pt-10">
			<span className="sr-only">{label}</span>
			<Skeleton className={styles.first()} />
			<Skeleton className={styles.second()} />
		</div>
	);
}
