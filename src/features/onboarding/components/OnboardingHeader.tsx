import Link from "next/link";

import ArrowLeftIcon from "@/shared/assets/icons/arrow-left.svg";
import { SvgIcon } from "@/shared/ui/SvgIcon";

import { buildPreviousStepPath, ONBOARDING_STEPS, type OnboardingStep } from "../model/steps";

interface OnboardingHeaderProps {
	step: OnboardingStep;
}

export function OnboardingHeader({ step }: OnboardingHeaderProps) {
	return (
		<header className="sticky top-0 z-10 flex items-center gap-2 bg-bg-1/90 px-4 py-3 backdrop-blur">
			<Link
				href={buildPreviousStepPath(step)}
				aria-label={step === 1 ? "처음 화면으로" : `${String(step - 1)}단계로`}
				className="flex size-9 items-center justify-center rounded-full text-zinc-700 focus-ring hover:bg-zinc-100"
			>
				<SvgIcon icon={ArrowLeftIcon} size={20} />
			</Link>
			<p className="min-w-0 flex-1 text-base font-semibold">
				{step}단계
				<span className="ml-1 text-sm font-normal text-zinc-500">/ {ONBOARDING_STEPS.length}</span>
			</p>
		</header>
	);
}
