export const REGIONS = ["seongsu", "yeouido", "hongdae", "sinchon", "yongsan"] as const;

export type Region = (typeof REGIONS)[number];

export const REGION_LABELS: Record<Region, string> = {
	seongsu: "성수",
	yeouido: "여의도",
	hongdae: "홍대",
	sinchon: "신촌",
	yongsan: "용산"
};

export function isRegion(value: string | null): value is Region {
	return value !== null && REGIONS.includes(value as Region);
}
