import type { PlannerResponse, PlannerStopResponse } from "@/features/course/api/get-planner";

export const TODAY = "2026-10-01";

const AREAS = [
	{ id: 1, name: "성수" },
	{ id: 2, name: "홍대" },
	{ id: 3, name: "잠실" }
];

export function buildPlannerFormResponse(overrides: Record<string, unknown> = {}) {
	return {
		defaults: { areaId: 1, interestCategoryIds: [11], preferredActivityIds: [21] },
		options: {
			areas: AREAS,
			interestCategories: [
				{ id: 11, name: "캐릭터" },
				{ id: 12, name: "패션" }
			],
			preferredActivities: [
				{ id: 21, name: "포토존" },
				{ id: 22, name: "굿즈 구매" }
			],
			accompanyTypes: [
				{ code: "ALONE", label: "혼자", description: null },
				{ code: "WITH_FRIEND", label: "친구와", description: null },
				{ code: "COUPLE", label: "연인과", description: null },
				{ code: "WITH_FAMILY", label: "가족과", description: null }
			],
			durationTypes: [
				{ code: "SHORT", label: "간편", description: "팝업 2곳, 약 3시간" },
				{ code: "HALF_DAY", label: "반나절", description: "팝업 3~5곳, 약 5시간" }
			]
		},
		visitDateRange: { min: TODAY, max: "2026-10-31" },
		startTimeRange: { min: "08:00", max: "20:00" },
		...overrides
	};
}

export function buildPlannerStop(overrides: Partial<PlannerStopResponse> = {}) {
	const stop: PlannerStopResponse = {
		visitOrder: 1,
		popupId: 1701,
		title: "오래오래 함께가게",
		address: "서울 성동구 연무장길 1",
		latitude: 37.5445,
		longitude: 127.0557,
		imageUrl: null,
		openingHours: "매일 11:00~20:00",
		visitAt: "14:00",
		stayMin: 60,
		reason: "캐릭터 굿즈를 좋아하는 취향에 맞아요",
		nextTravelMin: null,
		nextTravelM: null,
		...overrides
	};

	return stop;
}

export function buildPlannerResponse(overrides: Partial<PlannerResponse> = {}) {
	const planner: PlannerResponse = {
		plannerId: 12,
		status: "DRAFT",
		title: "성수 감성 팝업 코스",
		summary: "성수 골목의 캐릭터 팝업을 걸어서 둘러보는 코스",
		area: AREAS[0] ?? { id: 1, name: "성수" },
		accompanyType: "WITH_FRIEND",
		durationType: "HALF_DAY",
		visitDate: "2026-10-03",
		startTime: "14:00",
		endTime: "17:20",
		totalMin: 200,
		totalTravelM: 668,
		requestNote: null,
		stops: [
			buildPlannerStop({ nextTravelMin: 9, nextTravelM: 668 }),
			buildPlannerStop({ visitOrder: 2, popupId: 1702, title: "성수 향수 공방", visitAt: "15:10" })
		],
		createdAt: "2026-09-28T19:40:00+09:00",
		confirmedAt: null,
		...overrides
	};

	return planner;
}

export function buildPlannerSummary(overrides: Record<string, unknown> = {}) {
	return {
		plannerId: 12,
		status: "SCHEDULED",
		title: "성수 감성 팝업 코스",
		area: AREAS[0],
		visitDate: "2026-10-03",
		startTime: "14:00",
		endTime: "17:20",
		totalMin: 200,
		stopCount: 3,
		firstStop: { title: "오래오래 함께가게", imageUrl: null },
		confirmedAt: "2026-09-28T19:42:10+09:00",
		canceledAt: null,
		...overrides
	};
}

export function buildPlannerPage(
	content: unknown[],
	overrides: { hasNext?: boolean; nextCursor?: string | null } = {}
) {
	return { content, hasNext: false, nextCursor: null, ...overrides };
}
