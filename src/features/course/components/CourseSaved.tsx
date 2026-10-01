"use client";

import Image from "next/image";

import { useBackToPlanner } from "../hooks/useBackToPlanner";
import type { Course } from "../model/course";
import { CourseCalendarActions } from "./CourseCalendarActions";
import { CourseSummaryCard } from "./CourseSummaryCard";

interface CourseSavedProps {
	course: Course;
}

export function CourseSaved({ course }: CourseSavedProps) {
	useBackToPlanner();

	return (
		<main className="flex flex-1 flex-col px-5 pt-21">
			<div className="flex flex-col items-center text-center">
				<Image src="/images/illustrations/course-saved-check.svg" alt="" width={80} height={80} loading="eager" />
				<h1 className="mt-8 text-h1 text-text-1">플래너 등록 완료!</h1>
				<p className="mt-5 text-b2-14 whitespace-pre-line text-text-4">
					{"코스가 플래너에 안전하게 추가됐어요.\n저장된 코스는 마이 화면에서 확인할 수 있어요."}
				</p>
			</div>
			<div className="mt-10.5">
				<CourseSummaryCard course={course} />
			</div>
			<div className="mt-8">
				<CourseCalendarActions course={course} />
			</div>
		</main>
	);
}
