"use client";

import { getSeoulNow } from "@/shared/lib/date";

import type { Course } from "../model/course";
import { buildCourseIcs, buildCourseIcsFileName, buildGoogleCalendarUrl } from "../model/course-calendar";

interface CourseCalendarActionsProps {
	course: Course;
}

const ICS_MIME_TYPE = "text/calendar;charset=utf-8";

export function CourseCalendarActions({ course }: CourseCalendarActionsProps) {
	const handleIcsDownload = () => {
		const blob = new Blob([buildCourseIcs(course, getSeoulNow())], { type: ICS_MIME_TYPE });
		const url = URL.createObjectURL(blob);
		const anchor = document.createElement("a");

		anchor.href = url;
		anchor.download = buildCourseIcsFileName(course);
		anchor.click();
		URL.revokeObjectURL(url);
	};

	return (
		<div className="flex gap-2.5">
			<a
				href={buildGoogleCalendarUrl(course)}
				target="_blank"
				rel="noopener noreferrer"
				className="flex h-10.5 flex-1 items-center justify-center rounded-xl bg-primary text-b1-14 text-text-w focus-ring transition-colors hover:bg-primary-strong"
			>
				구글 캘린더에 저장하기
				<span className="sr-only">(새 탭에서 열림)</span>
			</a>
			<button
				type="button"
				onClick={handleIcsDownload}
				className="h-10.5 flex-1 rounded-xl bg-primary-subtle text-b1-14 text-primary focus-ring transition-colors hover:bg-primary/15"
			>
				캘린더 파일 다운로드
			</button>
		</div>
	);
}
