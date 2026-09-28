import { api } from "@/shared/api/client";
import type { CompanionType, PartySize } from "@/shared/model/trip-preference";

import type { OnboardingAnswers } from "../model/answers";

/** 서버 OnboardingRegisterRequest. 1단계를 건너뛰면 동행 유형과 인원수를 null로 보낸다 */
interface OnboardingRegisterRequest {
	accompanyType: CompanionType | null;
	numOfAccompany: number | null;
	interestCategoryIds: number[];
	favoriteAreaIds: number[];
	preferredActivityIds: number[];
	additionalInfo: string;
}

/** 서버 numOfAccompany는 동행 인원수다. 4는 4명 이상을 뜻한다 */
const NUM_OF_ACCOMPANY_BY_PARTY_SIZE: Record<PartySize, number> = {
	1: 1,
	2: 2,
	3: 3,
	4: 4
};

function toNumOfAccompany(partySize: PartySize | null) {
	return partySize === null ? null : NUM_OF_ACCOMPANY_BY_PARTY_SIZE[partySize];
}

function toOnboardingRegisterRequest(answers: OnboardingAnswers) {
	const request: OnboardingRegisterRequest = {
		accompanyType: answers.companionType,
		numOfAccompany: toNumOfAccompany(answers.partySize),
		interestCategoryIds: answers.categoryIds,
		favoriteAreaIds: answers.areaIds,
		preferredActivityIds: answers.activityIds,
		additionalInfo: answers.freeText
	};

	return request;
}

export async function saveOnboarding(answers: OnboardingAnswers) {
	await api.post<null>("/api/v1/members/me/onboarding", { json: toOnboardingRegisterRequest(answers) });
}
