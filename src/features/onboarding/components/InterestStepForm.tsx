import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { type SubmitEvent, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { buildOnboardingStepPath } from "@/shared/model/onboarding-path";
import { AlertDialog } from "@/shared/ui/AlertDialog";

import { favoriteAreasQueryOptions, interestCategoriesQueryOptions } from "../api/onboarding-options";
import { useFocusAfterRetry } from "../hooks/useFocusAfterRetry";
import { filterListedIds, isStepIncomplete, type OnboardingStepAnswers, toggleSelectedId } from "../model/answers";
import { EMPTY_SELECTION_MESSAGE, ONBOARDING_QUESTION_LABELS, OPTIONS_LOADING_MESSAGE } from "../model/messages";
import { useOnboardingStore } from "../model/useOnboardingStore";
import { ChoiceChipGroup } from "./ChoiceChipGroup";
import { OnboardingStepSkeleton } from "./OnboardingStepSkeleton";
import { OptionsLoadFailure } from "./OptionsLoadFailure";
import { StepActions } from "./StepActions";

const NEXT_STEP_PATH = buildOnboardingStepPath(3);

interface InterestStepFormProps {
	initialAnswers: OnboardingStepAnswers[2];
}

export function InterestStepForm({ initialAnswers }: InterestStepFormProps) {
	const router = useRouter();
	const setStepAnswers = useOnboardingStore((state) => state.setStepAnswers);
	const clearStepAnswers = useOnboardingStore((state) => state.clearStepAnswers);
	const categoriesQuery = useQuery(interestCategoriesQueryOptions());
	const areasQuery = useQuery(favoriteAreasQueryOptions());
	const { control, setValue } = useForm<OnboardingStepAnswers[2]>({ defaultValues: initialAnswers });
	const [categoryIds, areaIds] = useWatch({ control, name: ["categoryIds", "areaIds"] });
	const [isIncompleteAlertOpen, setIsIncompleteAlertOpen] = useState(false);
	const { markRetry, focusTargetRef } = useFocusAfterRetry<HTMLFieldSetElement>();

	const handleRetry = () => {
		markRetry();

		if (categoriesQuery.isError) {
			void categoriesQuery.refetch();
		}

		if (areasQuery.isError) {
			void areasQuery.refetch();
		}
	};

	if (categoriesQuery.isError || areasQuery.isError) {
		return (
			<OptionsLoadFailure isRetrying={categoriesQuery.isFetching || areasQuery.isFetching} onRetry={handleRetry} />
		);
	}

	if (categoriesQuery.isPending || areasQuery.isPending) {
		return <OnboardingStepSkeleton step={2} label={OPTIONS_LOADING_MESSAGE} />;
	}

	const categories = categoriesQuery.data;
	const areas = areasQuery.data;
	const categoryOptions = categories.map(({ id, category }) => ({ value: id, label: category }));
	const areaOptions = areas.map(({ id, area }) => ({ value: id, label: area }));

	const handleCategoryToggle = (id: number) => {
		setValue("categoryIds", toggleSelectedId(categoryIds, id));
	};

	const handleAreaToggle = (id: number) => {
		setValue("areaIds", toggleSelectedId(areaIds, id));
	};

	const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
		event.preventDefault();

		const answers = { categoryIds: filterListedIds(categoryIds, categories), areaIds: filterListedIds(areaIds, areas) };
		if (isStepIncomplete(2, answers, { categoryIds: categories.length, areaIds: areas.length })) {
			setIsIncompleteAlertOpen(true);
			return;
		}

		setStepAnswers(2, answers);
		router.push(NEXT_STEP_PATH);
	};

	const handleSkip = () => {
		clearStepAnswers(2);
		router.push(NEXT_STEP_PATH);
	};

	const handleIncompleteAlertConfirm = () => {
		setIsIncompleteAlertOpen(false);
	};

	return (
		<>
			<form onSubmit={handleSubmit} className="flex flex-1 flex-col">
				<div className="flex flex-col gap-10 px-5 pt-10 pb-10">
					<ChoiceChipGroup
						ref={focusTargetRef}
						legend={ONBOARDING_QUESTION_LABELS.categories}
						name="categoryIds"
						mode="multiple"
						options={categoryOptions}
						selectedValues={categoryIds}
						onSelect={handleCategoryToggle}
					/>
					<ChoiceChipGroup
						legend={ONBOARDING_QUESTION_LABELS.areas}
						name="areaIds"
						mode="multiple"
						options={areaOptions}
						selectedValues={areaIds}
						onSelect={handleAreaToggle}
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
