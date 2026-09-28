import { queryOptions } from "@tanstack/react-query";

import { api } from "@/shared/api/client";

export interface InterestCategoryResponse {
	id: number;
	category: string;
}

export interface FavoriteAreaResponse {
	id: number;
	area: string;
}

export interface PreferredActivityResponse {
	id: number;
	activity: string;
}

export function getInterestCategories(signal?: AbortSignal) {
	return api.get<InterestCategoryResponse[]>("/api/v1/onboardings/interest-categories", { signal });
}

export function getFavoriteAreas(signal?: AbortSignal) {
	return api.get<FavoriteAreaResponse[]>("/api/v1/onboardings/favorite-areas", { signal });
}

export function getPreferredActivities(signal?: AbortSignal) {
	return api.get<PreferredActivityResponse[]>("/api/v1/onboardings/preferred-activities", { signal });
}

export function interestCategoriesQueryOptions() {
	return queryOptions({
		queryKey: ["onboarding", "options", "interest-categories"],
		queryFn: ({ signal }) => getInterestCategories(signal),
		staleTime: Infinity
	});
}

export function favoriteAreasQueryOptions() {
	return queryOptions({
		queryKey: ["onboarding", "options", "favorite-areas"],
		queryFn: ({ signal }) => getFavoriteAreas(signal),
		staleTime: Infinity
	});
}

export function preferredActivitiesQueryOptions() {
	return queryOptions({
		queryKey: ["onboarding", "options", "preferred-activities"],
		queryFn: ({ signal }) => getPreferredActivities(signal),
		staleTime: Infinity
	});
}
