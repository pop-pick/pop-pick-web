import { queryOptions } from "@tanstack/react-query";

import { api } from "@/shared/api/client";

interface InterestCategoryResponse {
	id: number;
	category: string;
}

interface FavoriteAreaResponse {
	id: number;
	area: string;
}

interface PreferredActivityResponse {
	id: number;
	activity: string;
}

function getInterestCategories(signal?: AbortSignal) {
	return api.get<InterestCategoryResponse[]>("/api/v1/onboardings/interest-categories", { signal });
}

function getFavoriteAreas(signal?: AbortSignal) {
	return api.get<FavoriteAreaResponse[]>("/api/v1/onboardings/favorite-areas", { signal });
}

function getPreferredActivities(signal?: AbortSignal) {
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
