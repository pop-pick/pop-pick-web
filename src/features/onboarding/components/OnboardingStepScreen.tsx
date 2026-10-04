"use client";

import { useOnboardingAnswers } from "../hooks/useOnboardingAnswers";
import { ANSWERS_LOADING_MESSAGE, ANSWERS_STORAGE_FAILURE_MESSAGE } from "../model/messages";
import type { OnboardingStep } from "../model/steps";
import { ActivityStepForm } from "./ActivityStepForm";
import { CompanionStepForm } from "./CompanionStepForm";
import { InterestStepForm } from "./InterestStepForm";
import { OnboardingStepIntro } from "./OnboardingStepIntro";
import { OnboardingStepSkeleton } from "./OnboardingStepSkeleton";

interface OnboardingStepScreenProps {
	step: OnboardingStep;
}

export function OnboardingStepScreen({ step }: OnboardingStepScreenProps) {
	const { answers, loadStatus } = useOnboardingAnswers();
	const isAnswersLoaded = loadStatus !== "loading";

	return (
		<div className="flex flex-1 flex-col">
			<OnboardingStepIntro step={step} />
			{loadStatus === "failed" && (
				<p role="status" className="mx-5 mt-4 rounded-xl bg-error-bg px-4 py-3 text-b3-14 text-error">
					{ANSWERS_STORAGE_FAILURE_MESSAGE}
				</p>
			)}
			{loadStatus === "loading" && <OnboardingStepSkeleton step={step} label={ANSWERS_LOADING_MESSAGE} />}
			{isAnswersLoaded && step === 1 && (
				<CompanionStepForm initialAnswers={{ companionType: answers.companionType, partySize: answers.partySize }} />
			)}
			{isAnswersLoaded && step === 2 && (
				<InterestStepForm initialAnswers={{ categoryIds: answers.categoryIds, areaIds: answers.areaIds }} />
			)}
			{isAnswersLoaded && step === 3 && (
				<ActivityStepForm initialAnswers={{ activityIds: answers.activityIds, freeText: answers.freeText }} />
			)}
		</div>
	);
}
