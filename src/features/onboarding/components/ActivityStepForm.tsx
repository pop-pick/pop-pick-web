"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { type SubmitEvent, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { AlertDialog } from "@/shared/ui/AlertDialog";
import { Skeleton } from "@/shared/ui/Skeleton";

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
	FREE_TEXT_PLACEHOLDER,
	ONBOARDING_QUESTION_LABELS,
	OPTIONS_LOADING_MESSAGE,
	SAVE_FAILURE_MESSAGE,
	SAVE_PENDING_MESSAGE,
	WELCOME_MESSAGE
} from "../model/messages";
import { useOnboardingStore } from "../model/useOnboardingStore";
import { ChoiceChipGroup } from "./ChoiceChipGroup";
import { FreeTextField } from "./FreeTextField";
import { OptionsLoadFailure } from "./OptionsLoadFailure";

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
	const [hasSaveFailed, setHasSaveFailed] = useState(false);
	const { markRetry, focusTargetRef } = useFocusAfterRetry<HTMLFieldSetElement>();

	const handleRetry = () => {
		markRetry();
		void activitiesQuery.refetch();
	};

	if (activitiesQuery.isError) {
		return <OptionsLoadFailure isRetrying={activitiesQuery.isFetching} onRetry={handleRetry} />;
	}

	if (activitiesQuery.isPending) {
		return (
			<div role="status" className="flex flex-col gap-10 px-5 pt-10">
				<span className="sr-only">{OPTIONS_LOADING_MESSAGE}</span>
				<Skeleton className="h-32" />
				<Skeleton className="h-36" />
			</div>
		);
	}

	const activities = activitiesQuery.data;
	const activityOptions = activities.map(({ id, activity }) => ({ value: id, label: activity }));

	const saveCommittedAnswers = () => {
		saveMutation.mutate(useOnboardingStore.getState().answers, {
			onSuccess: () => {
				setHasSaveFailed(false);
				setIsWelcomeAlertOpen(true);
			},
			onError: () => {
				setHasSaveFailed(true);
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
				<div className="flex flex-col gap-10 px-5 pt-10 pb-12">
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
						value={freeText}
						maxLength={ONBOARDING_FREE_TEXT_MAX_LENGTH}
						placeholder={FREE_TEXT_PLACEHOLDER}
						onChange={handleFreeTextChange}
					/>
				</div>
				<div className="sticky bottom-0 z-40 mt-auto flex flex-col gap-3 rounded-t-3xl bg-bg-1 px-4 pt-4 pb-float-gap shadow-bar">
					{hasSaveFailed && (
						<div
							role="alert"
							className="flex items-center justify-between gap-3 rounded-xl bg-error-bg px-4 py-3 text-b3-14 text-error"
						>
							<p>{SAVE_FAILURE_MESSAGE}</p>
							<button
								type="button"
								aria-disabled={saveMutation.isPending}
								onClick={handleSaveRetry}
								className="shrink-0 rounded-lg px-2 py-1 text-b1-14 underline focus-ring transition-colors not-aria-disabled:hover:bg-error/10 aria-disabled:opacity-40"
							>
								다시 시도
							</button>
						</div>
					)}
					{saveMutation.isPending && (
						<p role="status" className="sr-only">
							{SAVE_PENDING_MESSAGE}
						</p>
					)}
					<button
						type="submit"
						disabled={saveMutation.isPending}
						aria-busy={saveMutation.isPending}
						className="flex h-13 w-full items-center justify-center rounded-xl bg-primary text-h4 text-text-w focus-ring transition-colors not-disabled:hover:bg-primary-strong disabled:bg-bg-4 disabled:text-text-6"
					>
						POP PICK 시작하기
					</button>
				</div>
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
