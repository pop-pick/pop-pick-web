import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { type SubmitEvent, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { AlertDialog } from "@/shared/ui/AlertDialog";
import { BottomActionBar } from "@/shared/ui/BottomActionBar";
import { Button } from "@/shared/ui/Button";

import { preferredActivitiesQueryOptions } from "../api/onboarding-options";
import { useFocusAfterRetry } from "../hooks/useFocusAfterRetry";
import { useSaveOnboarding } from "../hooks/useSaveOnboarding";
import {
	filterListedIds,
	isStepIncomplete,
	ONBOARDING_FREE_TEXT_MAX_LENGTH,
	type OnboardingStepAnswers,
	toggleSelectedId
} from "../model/answers";
import {
	EMPTY_SELECTION_MESSAGE,
	FREE_TEXT_DESCRIPTION,
	FREE_TEXT_PLACEHOLDER,
	ONBOARDING_QUESTION_LABELS,
	OPTIONS_LOADING_MESSAGE,
	SAVE_PENDING_MESSAGE,
	WELCOME_MESSAGE
} from "../model/messages";
import { useOnboardingStore } from "../model/useOnboardingStore";
import { ChoiceChipGroup } from "./ChoiceChipGroup";
import { FreeTextField } from "./FreeTextField";
import { OnboardingStepSkeleton } from "./OnboardingStepSkeleton";
import { OptionsLoadFailure } from "./OptionsLoadFailure";
import { SaveFailureNotice } from "./SaveFailureNotice";

const MEMBER_HOME_PATH = "/";

interface ActivityStepFormProps {
	initialAnswers: OnboardingStepAnswers[3];
}

export function ActivityStepForm({ initialAnswers }: ActivityStepFormProps) {
	const router = useRouter();
	const setStepAnswers = useOnboardingStore((state) => state.setStepAnswers);
	const activitiesQuery = useQuery(preferredActivitiesQueryOptions());
	const saveMutation = useSaveOnboarding();
	const { control, setValue } = useForm<OnboardingStepAnswers[3]>({ defaultValues: initialAnswers });
	const [activityIds, freeText] = useWatch({ control, name: ["activityIds", "freeText"] });
	const [isIncompleteAlertOpen, setIsIncompleteAlertOpen] = useState(false);
	const [isWelcomeAlertOpen, setIsWelcomeAlertOpen] = useState(false);
	const [saveError, setSaveError] = useState<Error | null>(null);
	const hasCompanionAnswers = useOnboardingStore(
		(state) => state.answers.companionType !== null && state.answers.partySize !== null
	);
	const { markRetry, focusTargetRef } = useFocusAfterRetry<HTMLFieldSetElement>();

	const handleRetry = () => {
		markRetry();
		void activitiesQuery.refetch();
	};

	if (activitiesQuery.isError) {
		return <OptionsLoadFailure isRetrying={activitiesQuery.isFetching} onRetry={handleRetry} />;
	}

	if (activitiesQuery.isPending) {
		return <OnboardingStepSkeleton step={3} label={OPTIONS_LOADING_MESSAGE} />;
	}

	const activities = activitiesQuery.data;
	const activityOptions = activities.map(({ id, activity }) => ({ value: id, label: activity }));

	const saveCommittedAnswers = () => {
		saveMutation.mutate(useOnboardingStore.getState().answers, {
			onSuccess: () => {
				setSaveError(null);
				setIsWelcomeAlertOpen(true);
			},
			onError: (error) => {
				setSaveError(error);
			}
		});
	};

	const handleActivityToggle = (id: number) => {
		setValue("activityIds", toggleSelectedId(activityIds, id));
	};

	const handleFreeTextChange = (value: string) => {
		setValue("freeText", value);
	};

	const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
		event.preventDefault();

		const answers = { activityIds: filterListedIds(activityIds, activities), freeText };
		if (isStepIncomplete(3, answers, { activityIds: activities.length })) {
			setIsIncompleteAlertOpen(true);
			return;
		}

		setStepAnswers(3, answers);
		saveCommittedAnswers();
	};

	const handleSaveRetry = () => {
		if (saveMutation.isPending) {
			return;
		}

		saveCommittedAnswers();
	};

	const handleIncompleteAlertConfirm = () => {
		setIsIncompleteAlertOpen(false);
	};

	const handleWelcomeAlertConfirm = () => {
		setIsWelcomeAlertOpen(false);
		router.replace(MEMBER_HOME_PATH);
	};

	return (
		<>
			<form onSubmit={handleSubmit} className="flex flex-1 flex-col">
				<div className="flex flex-col gap-10 px-5 pt-10 pb-10">
					<ChoiceChipGroup
						ref={focusTargetRef}
						legend={ONBOARDING_QUESTION_LABELS.activities}
						name="activityIds"
						mode="multiple"
						options={activityOptions}
						selectedValues={activityIds}
						onSelect={handleActivityToggle}
					/>
					<FreeTextField
						label={ONBOARDING_QUESTION_LABELS.freeText}
						description={FREE_TEXT_DESCRIPTION}
						value={freeText}
						maxLength={ONBOARDING_FREE_TEXT_MAX_LENGTH}
						placeholder={FREE_TEXT_PLACEHOLDER}
						onChange={handleFreeTextChange}
					/>
				</div>
				<BottomActionBar>
					{saveError !== null && (
						<SaveFailureNotice
							error={saveError}
							isRetrying={saveMutation.isPending}
							hasCompanionAnswers={hasCompanionAnswers}
							onRetry={handleSaveRetry}
						/>
					)}
					{saveMutation.isPending && (
						<p role="status" className="sr-only">
							{SAVE_PENDING_MESSAGE}
						</p>
					)}
					<Button
						type="submit"
						size="xl"
						disabled={saveMutation.isPending}
						aria-busy={saveMutation.isPending}
						className="w-full"
					>
						POP PICK 시작하기
					</Button>
				</BottomActionBar>
			</form>
			<AlertDialog
				open={isIncompleteAlertOpen}
				message={EMPTY_SELECTION_MESSAGE}
				onConfirm={handleIncompleteAlertConfirm}
			/>
			<AlertDialog open={isWelcomeAlertOpen} message={WELCOME_MESSAGE} onConfirm={handleWelcomeAlertConfirm} />
		</>
	);
}
