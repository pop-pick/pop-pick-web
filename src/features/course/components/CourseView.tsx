"use client";

import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { EmptyState } from "@/shared/components/EmptyState";
import { LoadFailure } from "@/shared/components/LoadFailure";
import { PLANNER_PATH } from "@/shared/model/planner-path";
import { LinkButton } from "@/shared/ui/LinkButton";

import { courseDetailQueryOptions } from "../api/get-planner";
import { isCourseUnavailableError } from "../model/course-error";
import { buildRegenerateHref } from "../model/course-regenerate";
import { CourseDetail } from "./CourseDetail";
import { CourseRecommendation } from "./CourseRecommendation";
import { CourseSaved } from "./CourseSaved";
import { CourseViewSkeleton } from "./CourseViewSkeleton";

interface CourseViewProps {
	courseId: number;
	view: "detail" | "saved";
}

export function CourseView({ courseId, view }: CourseViewProps) {
	const searchParams = useSearchParams();
	const { data: course, error, isPending, refetch } = useQuery(courseDetailQueryOptions(courseId));

	useEffect(() => {
		if (error !== null && !isCourseUnavailableError(error)) {
			console.error(`[course] 코스 ${String(courseId)}를 불러오지 못했다`, error);
		}
	}, [courseId, error]);

	const handleRetry = () => {
		void refetch();
	};

	if (isPending) {
		return <CourseViewSkeleton />;
	}

	if (error !== null) {
		return (
			<main className="flex flex-1 flex-col items-center justify-center px-5">
				{isCourseUnavailableError(error) ? (
					<EmptyState
						hasWarningIcon
						title="삭제되었거나 볼 수 없는 코스입니다."
						description="플래너에서 다른 일정을 골라 주세요."
						action={<LinkButton href={PLANNER_PATH}>플래너로 가기</LinkButton>}
					/>
				) : (
					<LoadFailure title="일정을 불러오지 못했어요." onRetry={handleRetry} />
				)}
			</main>
		);
	}

	if (course.status === "DRAFT") {
		return (
			<CourseRecommendation course={course} regenerateHref={buildRegenerateHref(course, searchParams.toString())} />
		);
	}

	if (view === "saved" && course.status === "SCHEDULED") {
		return <CourseSaved course={course} />;
	}

	return <CourseDetail course={course} />;
}
