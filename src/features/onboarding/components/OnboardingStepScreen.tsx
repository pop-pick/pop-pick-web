"use client";

import Image from "next/image";

import { useOnboardingAnswers } from "../hooks/useOnboardingAnswers";
import {
	ANSWERS_LOADING_MESSAGE,
	ANSWERS_STORAGE_FAILURE_MESSAGE,
	ONBOARDING_STEP_DESCRIPTIONS,
	ONBOARDING_STEP_TITLES
} from "../model/messages";
import type { OnboardingStep } from "../model/steps";
import { ActivityStepForm } from "./ActivityStepForm";
import { CompanionStepForm } from "./CompanionStepForm";
import { InterestStepForm } from "./InterestStepForm";
import { OnboardingStepSkeleton } from "./OnboardingStepSkeleton";

const ILLUSTRATION_SIZE = 111;

interface OnboardingStepScreenProps {
	step: OnboardingStep;
}

export function OnboardingStepScreen({ step }: OnboardingStepScreenProps) {
	const { answers, loadStatus } = useOnboardingAnswers();

	return (
		<div className="flex flex-1 flex-col">
			<div className="flex flex-col items-center px-5 pt-1.75 text-center">
				<Image
					src={`/images/illustrations/onboarding-${step}.svg`}
					alt=""
					width={ILLUSTRATION_SIZE}
					height={ILLUSTRATION_SIZE}
					loading="eager"
				/>
				<h1 className="mt-2 text-h1 leading-8 text-text-1">{ONBOARDING_STEP_TITLES[step]}</h1>
				<p className="mt-3 min-h-10.5 text-b2-14 whitespace-pre-line text-text-4">
					{ONBOARDING_STEP_DESCRIPTIONS[step]}
				</p>
			</div>
			{loadStatus === "failed" && (
				<p role="status" className="mx-5 mt-4 rounded-xl bg-error-bg px-4 py-3 text-b3-14 text-error">
					{ANSWERS_STORAGE_FAILURE_MESSAGE}
				</p>
			)}
			{loadStatus === "loading" && <OnboardingStepSkeleton step={step} label={ANSWERS_LOADING_MESSAGE} />}
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
