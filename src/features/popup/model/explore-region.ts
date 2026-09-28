import { type Region, REGION_LABELS, REGIONS } from "@/shared/model/region";

/** null은 전체 지역이다 */
export const EXPLORE_REGION_OPTIONS = [null, ...REGIONS] as const;

const ALL_REGIONS_LABEL = "전체 지역";

export function formatExploreRegionLabel(region: Region | null) {
	return region === null ? ALL_REGIONS_LABEL : REGION_LABELS[region];
}
