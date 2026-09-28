export const COMPANION_TYPES = ["ALONE", "WITH_FRIEND", "COUPLE", "WITH_FAMILY"] as const;

export type CompanionType = (typeof COMPANION_TYPES)[number];

export const COMPANION_TYPE_LABELS: Record<CompanionType, string> = {
	ALONE: "혼자",
	WITH_FRIEND: "친구와",
	COUPLE: "연인과",
	WITH_FAMILY: "가족과"
};

export const PARTY_SIZES = [1, 2, 3, 4] as const;

export type PartySize = (typeof PARTY_SIZES)[number];

export const PARTY_SIZE_LABELS: Record<PartySize, string> = {
	1: "1명",
	2: "2명",
	3: "3명",
	4: "4명 이상"
};

export const PREFERRED_ACTIVITIES = ["GOODS", "PHOTO", "EXPERIENCE", "FOOD"] as const;

export type PreferredActivity = (typeof PREFERRED_ACTIVITIES)[number];

export const PREFERRED_ACTIVITY_LABELS: Record<PreferredActivity, string> = {
	GOODS: "굿즈 구경",
	PHOTO: "사진 찍기",
	EXPERIENCE: "체험하기",
	FOOD: "맛있는 것 먹기"
};

export const TRIP_DURATIONS = ["SHORT", "HALF_DAY"] as const;

export type TripDuration = (typeof TRIP_DURATIONS)[number];

export const TRIP_DURATION_LABELS: Record<TripDuration, string> = {
	SHORT: "간편 (2시간 내외)",
	HALF_DAY: "반나절(4-5시간)"
};

/** 명세: 간편은 팝업 2곳, 반나절은 3곳 이상 */
export const TRIP_DURATION_STOP_COUNTS: Record<TripDuration, number> = {
	SHORT: 2,
	HALF_DAY: 3
};

export function isCompanionType(value: string | null): value is CompanionType {
	return value !== null && COMPANION_TYPES.includes(value as CompanionType);
}

export function isPartySize(value: number): value is PartySize {
	return PARTY_SIZES.includes(value as PartySize);
}

export function isPreferredActivity(value: string): value is PreferredActivity {
	return PREFERRED_ACTIVITIES.includes(value as PreferredActivity);
}

export function isTripDuration(value: string | null): value is TripDuration {
	return value !== null && TRIP_DURATIONS.includes(value as TripDuration);
}
