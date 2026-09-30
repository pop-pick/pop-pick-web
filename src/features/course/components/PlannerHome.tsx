"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useEffect, useId } from "react";

import { EmptyState } from "@/shared/components/EmptyState";
import { buildCoursePath } from "@/shared/model/course-path";
import { Skeleton } from "@/shared/ui/Skeleton";
import { Tabs } from "@/shared/ui/Tabs";

import { courseListQueryOptions } from "../api/get-planners";
import {
	buildCourseTabId,
	COURSE_TAB_EMPTY_TITLES,
	COURSE_TAB_ITEMS,
	type CourseTab,
	parseCourseTab,
	toPlannerTabHref
} from "../model/course-tab";
import { CourseListMoreTrigger } from "./CourseListMoreTrigger";
import { CourseLoadFailure } from "./CourseLoadFailure";
import { CourseStartBanner } from "./CourseStartBanner";
import { CourseSummaryCard } from "./CourseSummaryCard";

const EMPTY_DESCRIPTION = "AI POP PICK으로\n나에게 꼭 맞는 팝업 코스를 만들어보세요.";

export function PlannerHome() {
	const searchParams = useSearchParams();
	const panelId = useId();
	const tab = parseCourseTab(searchParams);
	const {
		data: courses,
		error,
		isPending,
		refetch,
		hasNextPage,
		isFetchingNextPage,
		isFetchNextPageError,
		fetchNextPage
	} = useInfiniteQuery(courseListQueryOptions(tab));

	useEffect(() => {
		if (error !== null) {
			console.error(`[course] ${tab} 일정 목록을 불러오지 못했다`, error);
		}
	}, [error, tab]);

	const handleTabChange = (nextTab: CourseTab) => {
		window.history.replaceState(null, "", toPlannerTabHref(nextTab));
	};

	const handleRetry = () => {
		void refetch();
	};

	const handleMore = () => {
		void fetchNextPage();
	};

	return (
		<div className="flex flex-1 flex-col pt-6">
			<Tabs items={COURSE_TAB_ITEMS} value={tab} panelId={panelId} ariaLabel="일정 구분" onChange={handleTabChange} />
			<div
				id={panelId}
				role="tabpanel"
				aria-labelledby={buildCourseTabId(tab)}
				tabIndex={0}
				className="flex flex-1 flex-col px-5 pt-5 focus-ring"
			>
				{error !== null && courses === undefined && (
					<div className="flex flex-1 items-center justify-center py-10">
						<CourseLoadFailure title="일정을 불러오지 못했어요." onRetry={handleRetry} />
					</div>
				)}
				{isPending && (
					<div role="status" className="flex flex-col gap-5">
						<span className="sr-only">일정을 불러오고 있습니다</span>
						<Skeleton className="h-45.25 rounded-2xl" />
						<Skeleton className="h-49 rounded-2xl" />
					</div>
				)}
				{courses?.length === 0 && (
					<>
						<div className="flex flex-1 items-center justify-center pt-11.75 pb-10">
							<EmptyState hasWarningIcon title={COURSE_TAB_EMPTY_TITLES[tab]} description={EMPTY_DESCRIPTION} />
						</div>
						<CourseStartBanner actionLabel="나에게 맞는 팝업 찾기" isActionWide />
					</>
				)}
				{courses !== undefined && courses.length > 0 && (
					<div className="flex flex-col gap-5">
						<CourseStartBanner actionLabel="AI POP PICK 시작하기" />
						<ul aria-label="저장한 일정" aria-busy={isFetchingNextPage} className="flex flex-col gap-3">
							{courses.map((course) => (
								<li key={course.id}>
									<CourseSummaryCard course={course} href={buildCoursePath(course.id)} />
								</li>
							))}
						</ul>
						{hasNextPage && (
							<CourseListMoreTrigger
								isLoading={isFetchingNextPage}
								isFailed={isFetchNextPageError}
								onMore={handleMore}
							/>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
