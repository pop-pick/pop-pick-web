"use client";

import { useRouter } from "next/navigation";
import { type SubmitEvent, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { buildOnboardingStepPath } from "@/shared/model/onboarding-path";
import {
	COMPANION_TYPE_LABELS,
	COMPANION_TYPES,
	type CompanionType,
	PARTY_SIZE_LABELS,
	PARTY_SIZES,
	type PartySize
} from "@/shared/model/trip-preference";
import { AlertDialog } from "@/shared/ui/AlertDialog";

import { isStepIncomplete, type OnboardingStepAnswers, type StepOptionCounts } from "../model/answers";
import { EMPTY_SELECTION_MESSAGE, ONBOARDING_QUESTION_LABELS } from "../model/messages";
import { useOnboardingStore } from "../model/useOnboardingStore";
import { ChoiceChipGroup } from "./ChoiceChipGroup";
import { StepActions } from "./StepActions";

const COMPANION_TYPE_OPTIONS = COMPANION_TYPES.map((value) => ({ value, label: COMPANION_TYPE_LABELS[value] }));

const PARTY_SIZE_OPTIONS = PARTY_SIZES.map((value) => ({ value, label: PARTY_SIZE_LABELS[value] }));

const NEXT_STEP_PATH = buildOnboardingStepPath(2);

const OPTION_COUNTS: StepOptionCounts<1> = {
	companionType: COMPANION_TYPE_OPTIONS.length,
	partySize: PARTY_SIZE_OPTIONS.length
};

interface CompanionStepFormProps {
	initialAnswers: OnboardingStepAnswers[1];
}

export function CompanionStepForm({ initialAnswers }: CompanionStepFormProps) {
	const router = useRouter();
	const setStepAnswers = useOnboardingStore((state) => state.setStepAnswers);
	const clearStepAnswers = useOnboardingStore((state) => state.clearStepAnswers);
	const { control, setValue } = useForm<OnboardingStepAnswers[1]>({ defaultValues: initialAnswers });
	const [companionType, partySize] = useWatch({ control, name: ["companionType", "partySize"] });
	const [isIncompleteAlertOpen, setIsIncompleteAlertOpen] = useState(false);

	const handleCompanionTypeSelect = (value: CompanionType) => {
		setValue("companionType", value);
	};

	const handlePartySizeSelect = (value: PartySize) => {
		setValue("partySize", value);
	};

	const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
		event.preventDefault();

		const answers = { companionType, partySize };
		if (isStepIncomplete(1, answers, OPTION_COUNTS)) {
			setIsIncompleteAlertOpen(true);
			return;
		}

		setStepAnswers(1, answers);
		router.push(NEXT_STEP_PATH);
	};

	const handleSkip = () => {
		clearStepAnswers(1);
		router.push(NEXT_STEP_PATH);
	};

	const handleIncompleteAlertConfirm = () => {
		setIsIncompleteAlertOpen(false);
	};

	return (
		<>
			<form onSubmit={handleSubmit} className="flex flex-1 flex-col">
				<div className="flex flex-col gap-10 px-5 pt-10 pb-12">
					<ChoiceChipGroup
						legend={ONBOARDING_QUESTION_LABELS.companionType}
						name="companionType"
						mode="single"
						options={COMPANION_TYPE_OPTIONS}
						selectedValues={companionType === null ? [] : [companionType]}
						onSelect={handleCompanionTypeSelect}
					/>
					<ChoiceChipGroup
						legend={ONBOARDING_QUESTION_LABELS.partySize}
						name="partySize"
						mode="single"
						options={PARTY_SIZE_OPTIONS}
						selectedValues={partySize === null ? [] : [partySize]}
						onSelect={handlePartySizeSelect}
					/>
				</div>
				<StepActions onSkip={handleSkip} />
			</form>
			<AlertDialog
				open={isIncompleteAlertOpen}
				message={EMPTY_SELECTION_MESSAGE}
				onConfirm={handleIncompleteAlertConfirm}
			/>
		</>
	);
}
