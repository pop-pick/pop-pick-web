import type { CompanionType, PartySize } from "@/shared/model/trip-preference";

import type { OnboardingStep } from "./steps";

export const ONBOARDING_FREE_TEXT_MAX_LENGTH = 200;

type OnboardingOptionId = number;

export interface OnboardingAnswers {
	companionType: CompanionType | null;
	partySize: PartySize | null;
	categoryIds: OnboardingOptionId[];
	areaIds: OnboardingOptionId[];
	activityIds: OnboardingOptionId[];
	freeText: string;
}

export interface OnboardingStepAnswers {
	1: Pick<OnboardingAnswers, "companionType" | "partySize">;
	2: Pick<OnboardingAnswers, "categoryIds" | "areaIds">;
	3: Pick<OnboardingAnswers, "activityIds" | "freeText">;
}

export const EMPTY_STEP_ANSWERS: { [S in OnboardingStep]: OnboardingStepAnswers[S] } = {
	1: { companionType: null, partySize: null },
	2: { categoryIds: [], areaIds: [] },
	3: { activityIds: [], freeText: "" }
};

export const EMPTY_ANSWERS: OnboardingAnswers = {
	...EMPTY_STEP_ANSWERS[1],
	...EMPTY_STEP_ANSWERS[2],
	...EMPTY_STEP_ANSWERS[3]
};

type OnboardingChoiceField = "companionType" | "partySize" | "categoryIds" | "areaIds" | "activityIds";

const STEP_CHOICE_FIELDS = {
	1: ["companionType", "partySize"],
	2: ["categoryIds", "areaIds"],
	3: ["activityIds"]
} as const satisfies Record<OnboardingStep, readonly OnboardingChoiceField[]>;

export type StepOptionCounts<S extends OnboardingStep> = Record<(typeof STEP_CHOICE_FIELDS)[S][number], number>;

function hasChoice(value: OnboardingAnswers[OnboardingChoiceField] | undefined) {
	return Array.isArray(value) ? value.length > 0 : value !== null && value !== undefined;
}

/** 선택지 목록이 비어 오면 고를 수 없으니 그 항목은 필수에서 빠진다. 빼지 않으면 알럿에서 벗어날 길이 없다 */
export function isStepIncomplete<S extends OnboardingStep>(
	step: S,
	answers: OnboardingStepAnswers[S],
	optionCounts: StepOptionCounts<S>
) {
	const fields: readonly OnboardingChoiceField[] = STEP_CHOICE_FIELDS[step];
	const values: Partial<OnboardingAnswers> = answers;
	const counts: Partial<Record<OnboardingChoiceField, number>> = optionCounts;

	return fields.some((field) => counts[field] !== 0 && !hasChoice(values[field]));
}

export function toggleSelectedId(selectedIds: readonly OnboardingOptionId[], id: OnboardingOptionId) {
	return selectedIds.includes(id) ? selectedIds.filter((selectedId) => selectedId !== id) : [...selectedIds, id];
}

/** sessionStorage에 남은 id가 그 사이 서버 선택지에서 빠졌을 수 있다 */
export function filterListedIds(
	selectedIds: readonly OnboardingOptionId[],
	options: readonly { id: OnboardingOptionId }[]
) {
	return selectedIds.filter((id) => options.some((option) => option.id === id));
}
