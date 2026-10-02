export const REGIONS = ["yeouido", "hongdae", "jamsil", "yongsan", "seongsu"] as const;

export type Region = (typeof REGIONS)[number];

export const REGION_LABELS: Record<Region, string> = {
	yeouido: "여의도",
	hongdae: "홍대",
	jamsil: "잠실",
	yongsan: "용산",
	seongsu: "성수"
};
