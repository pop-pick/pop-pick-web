"use client";

import { EmptyState } from "@/shared/components/EmptyState";
import { PLANNER_PATH } from "@/shared/model/planner-path";
import { LinkButton } from "@/shared/ui/LinkButton";
import { Skeleton } from "@/shared/ui/Skeleton";

import { useSavedCourses } from "../hooks/useSavedCourses";
import { CourseDetail } from "./CourseDetail";
import { CourseSaved } from "./CourseSaved";
import { SavedCoursesLoadFailure } from "./SavedCoursesLoadFailure";

interface SavedCourseViewProps {
	courseId: number;
	view: "detail" | "registered";
}

export function SavedCourseView({ courseId, view }: SavedCourseViewProps) {
	const { courses, loadStatus } = useSavedCourses();
	const course = courses.find((saved) => saved.id === courseId);

	if (loadStatus === "failed") {
		return (
			<main className="flex flex-1 flex-col items-center justify-center px-5 pb-tab-bar-clearance">
				<SavedCoursesLoadFailure />
			</main>
		);
	}

	if (loadStatus === "loading") {
		return (
			<div role="status" className="flex flex-1 flex-col gap-5 px-5 pt-17">
				<span className="sr-only">일정을 불러오고 있습니다</span>
				<Skeleton className="h-38 rounded-2xl" />
				<Skeleton className="h-70 rounded-2xl" />
			</div>
		);
	}

	if (course?.savedAt == null) {
		return (
			<main className="flex flex-1 flex-col items-center justify-center px-5 pb-tab-bar-clearance">
				<EmptyState
					hasWarningIcon
					title="일정을 찾을 수 없어요."
					description={"이 브라우저에 저장한 일정만 볼 수 있어요.\n플래너에서 다시 골라 주세요."}
					action={<LinkButton href={PLANNER_PATH}>플래너로 가기</LinkButton>}
				/>
			</main>
		);
	}

	if (view === "detail") {
		return <CourseDetail course={course} />;
	}

	return <CourseSaved course={course} registeredAt={course.savedAt} />;
}
