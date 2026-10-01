"use client";

import { getSeoulNow } from "@/shared/lib/date";
import { Button } from "@/shared/ui/Button";
import { LinkButton } from "@/shared/ui/LinkButton";

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
			<LinkButton
				href={buildGoogleCalendarUrl(course)}
				target="_blank"
				rel="noopener noreferrer"
				size="md"
				className="flex-1"
			>
				구글 캘린더에 저장하기
				<span className="sr-only">(새 탭에서 열림)</span>
			</LinkButton>
			<Button variant="tonal" size="md" onClick={handleIcsDownload} className="flex-1">
				캘린더 파일 다운로드
			</Button>
		</div>
	);
}
