"use client";

import { Skeleton } from "@/shared/ui/Skeleton";

import { useOnboardingAnswers } from "../hooks/useOnboardingAnswers";
import { ANSWERS_LOADING_MESSAGE, ANSWERS_STORAGE_FAILURE_MESSAGE, ONBOARDING_STEP_TITLES } from "../model/messages";
import type { OnboardingStep } from "../model/steps";
import { ActivityStepForm } from "./ActivityStepForm";
import { CompanionStepForm } from "./CompanionStepForm";
import { InterestStepForm } from "./InterestStepForm";

interface OnboardingStepScreenProps {
	step: OnboardingStep;
}

export function OnboardingStepScreen({ step }: OnboardingStepScreenProps) {
	const { answers, loadStatus } = useOnboardingAnswers();

	return (
		<div className="flex flex-1 flex-col">
			<h1 className="px-5 pt-5.5 text-h1 leading-8 text-text-1">{ONBOARDING_STEP_TITLES[step]}</h1>
			{loadStatus === "failed" && (
				<p role="status" className="mx-5 mt-4 rounded-xl bg-error-bg px-4 py-3 text-b3-14 text-error">
					{ANSWERS_STORAGE_FAILURE_MESSAGE}
				</p>
			)}
			{loadStatus === "loading" && (
				<div role="status" className="flex flex-col gap-10 px-5 pt-10">
					<span className="sr-only">{ANSWERS_LOADING_MESSAGE}</span>
					<Skeleton className="h-32" />
					<Skeleton className="h-32" />
				</div>
			)}
			{loadStatus !== "loading" && step === 1 && (
				<CompanionStepForm initialAnswers={{ companionType: answers.companionType, partySize: answers.partySize }} />
			)}
			{loadStatus !== "loading" && step === 2 && (
				<InterestStepForm initialAnswers={{ categoryIds: answers.categoryIds, areaIds: answers.areaIds }} />
			)}
			{loadStatus !== "loading" && step === 3 && (
				<ActivityStepForm initialAnswers={{ activityIds: answers.activityIds, freeText: answers.freeText }} />
			)}
		</div>
	);
}
