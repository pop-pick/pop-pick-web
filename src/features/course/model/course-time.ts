import { addDays, format } from "date-fns";

import { DATE_ONLY_FORMAT, parseDateOnlyOrThrow } from "@/shared/lib/date";

import type { Course } from "./course";

type CourseTime = Pick<Course, "date" | "startAt" | "endAt">;

/** 서버가 끝 날짜를 주지 않아 끝 시각이 시작 시각보다 앞서면 다음 날로 본다 */
function isOvernightCourse({ startAt, endAt }: CourseTime) {
	return endAt < startAt;
}

export function toCourseEndDate(course: CourseTime) {
	return isOvernightCourse(course)
		? format(addDays(parseDateOnlyOrThrow(course.date), 1), DATE_ONLY_FORMAT)
		: course.date;
}
