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

export const TRIP_DURATIONS = ["SHORT", "HALF_DAY"] as const;

export type TripDuration = (typeof TRIP_DURATIONS)[number];

export const TRIP_DURATION_LABELS: Record<TripDuration, string> = {
	SHORT: "간편 (2시간 내외)",
	HALF_DAY: "반나절(4-5시간)"
};

export function isCompanionType(value: string | null): value is CompanionType {
	return value !== null && COMPANION_TYPES.includes(value as CompanionType);
}

export function isTripDuration(value: string | null): value is TripDuration {
	return value !== null && TRIP_DURATIONS.includes(value as TripDuration);
}
