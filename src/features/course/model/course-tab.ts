import { PLANNER_PATH } from "@/shared/model/planner-path";

export const COURSE_TABS = ["upcoming", "past", "cancelled"] as const;

export type CourseTab = (typeof COURSE_TABS)[number];

export const COURSE_TAB_EMPTY_TITLES: Record<CourseTab, string> = {
	upcoming: "아직 저장된 일정이 없어요.",
	past: "지난 일정이 없어요.",
	cancelled: "취소된 일정이 없어요."
};

const COURSE_TAB_LABELS: Record<CourseTab, string> = {
	upcoming: "다가오는 일정",
	past: "지난 일정",
	cancelled: "취소된 일정"
};

const DEFAULT_TAB: CourseTab = "upcoming";
const TAB_PARAM = "tab";

function isCourseTab(value: string | null): value is CourseTab {
	return value !== null && COURSE_TABS.includes(value as CourseTab);
}

export function parseCourseTab(searchParams: URLSearchParams) {
	const tab = searchParams.get(TAB_PARAM);
	return isCourseTab(tab) ? tab : DEFAULT_TAB;
}

export function toPlannerTabHref(tab: CourseTab) {
	return tab === DEFAULT_TAB ? PLANNER_PATH : `${PLANNER_PATH}?${TAB_PARAM}=${tab}`;
}

export function buildCourseTabId(tab: CourseTab) {
	return `course-tab-${tab}`;
}

export const COURSE_TAB_ITEMS = COURSE_TABS.map((value) => ({
	value,
	id: buildCourseTabId(value),
	label: COURSE_TAB_LABELS[value]
}));
