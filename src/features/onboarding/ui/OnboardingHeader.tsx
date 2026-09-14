import Link from "next/link";

import { getPreviousPath, ONBOARDING_STEPS, type OnboardingStep } from "../model/steps";

interface OnboardingHeaderProps {
	step: OnboardingStep;
}

export function OnboardingHeader({ step }: OnboardingHeaderProps) {
	return (
		<header className="sticky top-0 z-10 flex items-center gap-2 bg-background/90 px-4 py-3 backdrop-blur">
			<Link
				href={getPreviousPath(step)}
				aria-label={step === 1 ? "처음 화면으로" : `${String(step - 1)}단계로`}
				className="flex size-9 items-center justify-center rounded-full text-zinc-700 focus-ring hover:bg-zinc-100"
			>
				<svg viewBox="0 0 24 24" aria-hidden className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
					<path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
				</svg>
			</Link>
			<p className="min-w-0 flex-1 text-base font-semibold">
				{step}단계
				<span className="ml-1 text-sm font-normal text-zinc-500">/ {ONBOARDING_STEPS.length}</span>
			</p>
		</header>
	);
}
