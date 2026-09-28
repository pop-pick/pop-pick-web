import Link from "next/link";

import ArrowLeftIcon from "@/shared/assets/icons/arrow-left.svg";
import { SvgIcon } from "@/shared/ui/SvgIcon";

import { ONBOARDING_HEADER_TITLE } from "../model/messages";
import { buildPreviousStepPath, ONBOARDING_STEPS, type OnboardingStep } from "../model/steps";

interface OnboardingHeaderProps {
	step: OnboardingStep;
}

export function OnboardingHeader({ step }: OnboardingHeaderProps) {
	const totalSteps = ONBOARDING_STEPS.length;

	return (
		<header className="sticky top-0 z-10 flex items-center gap-2 bg-bg-1/90 px-3 py-3 backdrop-blur">
			<Link
				href={buildPreviousStepPath(step)}
				aria-label={step === 1 ? "처음 화면으로" : `${String(step - 1)}단계로`}
				className="flex size-10 items-center justify-center rounded-full text-icon focus-ring transition-colors hover:bg-bg-3"
			>
				<SvgIcon icon={ArrowLeftIcon} size={24} />
			</Link>
			<p className="min-w-0 flex-1 truncate text-center text-h4 text-text-1">{ONBOARDING_HEADER_TITLE}</p>
			<p className="px-2 text-b1-16 text-primary">
				<span aria-hidden="true">{`${String(step)}/${String(totalSteps)}`}</span>
				<span className="sr-only">{`${String(totalSteps)}단계 중 ${String(step)}단계`}</span>
			</p>
		</header>
	);
}
