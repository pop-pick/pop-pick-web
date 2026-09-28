import type { CompanionType, PartySize } from "@/shared/model/trip-preference";

export const ONBOARDING_COMPANION_TYPE_LABELS: Record<CompanionType, string> = {
	ALONE: "혼자",
	WITH_FRIEND: "친구",
	COUPLE: "연인",
	WITH_FAMILY: "가족"
};

export const ONBOARDING_PARTY_SIZE_LABELS: Record<PartySize, string> = {
	1: "혼자",
	2: "2명",
	3: "3명",
	4: "4명 이상"
};
