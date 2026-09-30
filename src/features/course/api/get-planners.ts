import { infiniteQueryOptions } from "@tanstack/react-query";

import { api } from "@/shared/api/client";
import type { PageResponse } from "@/shared/api/types";
import { toSeoulDateOnly } from "@/shared/lib/date";

import type { CourseStatus, CourseSummary } from "../model/course";
import type { CourseTab } from "../model/course-tab";
import type { PlannerAreaResponse } from "./get-planner";

const PAGE_SIZE = 20;

const PLANNER_LIST_TABS: Record<CourseTab, string> = {
	upcoming: "UPCOMING",
	past: "PAST",
	cancelled: "CANCELED"
};

interface PlannerSummaryResponse {
	plannerId: number;
	status: CourseStatus;
	title: string;
	area: PlannerAreaResponse;
	visitDate: string;
	startTime: string;
	endTime: string;
	totalMin: number;
	stopCount: number;
	confirmedAt: string | null;
	canceledAt: string | null;
}

function toCourseSummary(planner: PlannerSummaryResponse) {
	const summary: CourseSummary = {
		id: planner.plannerId,
		status: planner.status,
		title: planner.title,
		date: planner.visitDate,
		startAt: planner.startTime,
		endAt: planner.endTime,
		totalMinutes: planner.totalMin,
		stopCount: planner.stopCount,
		registeredAt: planner.confirmedAt === null ? null : toSeoulDateOnly(planner.confirmedAt)
	};

	return summary;
}

export function getPlanners(tab: CourseTab, cursor: string | null, signal?: AbortSignal) {
	return api.get<PageResponse<PlannerSummaryResponse>>("/api/v1/planners", {
		query: { tab: PLANNER_LIST_TABS[tab], cursor, size: PAGE_SIZE },
		signal
	});
}

export function courseListQueryOptions(tab: CourseTab) {
	return infiniteQueryOptions({
		queryKey: ["course", "list", tab],
		queryFn: ({ pageParam, signal }) => getPlanners(tab, pageParam, signal),
		initialPageParam: null as string | null,
		getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.nextCursor : null),
		select: (data) => data.pages.flatMap((page) => page.content.map(toCourseSummary))
	});
}
