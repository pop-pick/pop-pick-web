import { api } from "@/shared/api/client";
import type { CompanionType, PartySize } from "@/shared/model/trip-preference";

import type { OnboardingAnswers } from "../model/answers";

/** 서버 OnboardingRegisterRequest. 1단계를 건너뛰면 동행 유형과 인원수를 null로 보낸다. numOfAccompany 4는 4명 이상이다 */
interface OnboardingRegisterRequest {
	accompanyType: CompanionType | null;
	numOfAccompany: PartySize | null;
	interestCategoryIds: number[];
	favoriteAreaIds: number[];
	preferredActivityIds: number[];
	additionalInfo: string;
}

export async function saveOnboarding(answers: OnboardingAnswers) {
	const request: OnboardingRegisterRequest = {
		accompanyType: answers.companionType,
		numOfAccompany: answers.partySize,
		interestCategoryIds: answers.categoryIds,
		favoriteAreaIds: answers.areaIds,
		preferredActivityIds: answers.activityIds,
		additionalInfo: answers.freeText
	};

	await api.post<null>("/api/v1/members/me/onboarding", { json: request });
}
