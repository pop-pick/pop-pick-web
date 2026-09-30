"use client";

import { useSearchParams } from "next/navigation";
import { useId, useMemo, useState } from "react";

import { EmptyState } from "@/shared/components/EmptyState";
import { getSeoulToday } from "@/shared/lib/date";
import { Skeleton } from "@/shared/ui/Skeleton";
import { Tabs } from "@/shared/ui/Tabs";

import { useSavedCourses } from "../hooks/useSavedCourses";
import { buildCoursePath } from "../model/course-path";
import {
	buildCourseTabId,
	COURSE_TAB_EMPTY_TITLES,
	COURSE_TAB_ITEMS,
	type CourseTab,
	filterCoursesByTab,
	parseCourseTab,
	toPlannerTabHref
} from "../model/course-tab";
import { CourseStartBanner } from "./CourseStartBanner";
import { CourseSummaryCard } from "./CourseSummaryCard";
import { SavedCoursesLoadFailure } from "./SavedCoursesLoadFailure";

const EMPTY_DESCRIPTION = "AI POP PICK으로\n나에게 꼭 맞는 팝업 코스를 만들어보세요.";

export function PlannerHome() {
	const searchParams = useSearchParams();
	const { courses, loadStatus } = useSavedCourses();
	const panelId = useId();
	const [today] = useState(getSeoulToday);

	const tab = parseCourseTab(searchParams);
	const tabCourses = useMemo(() => filterCoursesByTab(courses, tab, today), [courses, tab, today]);

	const handleTabChange = (nextTab: CourseTab) => {
		window.history.replaceState(null, "", toPlannerTabHref(nextTab));
	};

	return (
		<div className="flex flex-1 flex-col pt-17">
			<Tabs items={COURSE_TAB_ITEMS} value={tab} panelId={panelId} ariaLabel="일정 구분" onChange={handleTabChange} />
			<div
				id={panelId}
				role="tabpanel"
				aria-labelledby={buildCourseTabId(tab)}
				tabIndex={0}
				className="flex flex-1 flex-col px-5 pt-5 pb-tab-bar-clearance focus-ring"
			>
				{loadStatus === "failed" && (
					<div className="flex flex-1 items-center justify-center py-10">
						<SavedCoursesLoadFailure />
					</div>
				)}
				{loadStatus === "loading" && (
					<div role="status" className="flex flex-col gap-5">
						<span className="sr-only">저장한 일정을 불러오고 있습니다</span>
						<Skeleton className="h-45.25 rounded-2xl" />
						<Skeleton className="h-49 rounded-2xl" />
					</div>
				)}
				{loadStatus === "ready" && tabCourses.length === 0 && (
					<>
						<div className="flex flex-1 items-center justify-center py-10">
							<EmptyState hasWarningIcon title={COURSE_TAB_EMPTY_TITLES[tab]} description={EMPTY_DESCRIPTION} />
						</div>
						<CourseStartBanner actionLabel="나에게 맞는 팝업 찾기" isActionWide />
					</>
				)}
				{loadStatus === "ready" && tabCourses.length > 0 && (
					<div className="flex flex-col gap-5">
						<CourseStartBanner actionLabel="AI POP PICK 시작하기" />
						<ul aria-label="저장한 일정" className="flex flex-col gap-3">
							{tabCourses.map((course) => (
								<li key={course.id}>
									<CourseSummaryCard course={course} registeredAt={course.savedAt} href={buildCoursePath(course.id)} />
								</li>
							))}
						</ul>
					</div>
				)}
			</div>
		</div>
	);
}
