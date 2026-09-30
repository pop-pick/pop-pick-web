import { addDays, format } from "date-fns";

import { DATE_ONLY_FORMAT, parseDateOnlyOrThrow } from "@/shared/lib/date";

import type { Course } from "./course";

type CourseTime = Pick<Course, "date" | "startAt" | "endAt">;

/** 시작 시각이 늦으면 코스가 자정을 넘겨 끝 시각이 시작 시각보다 앞선다. 그때 끝은 다음 날이다 */
function isOvernightCourse({ startAt, endAt }: CourseTime) {
	return endAt < startAt;
}

export function toCourseEndDate(course: CourseTime) {
	return isOvernightCourse(course)
		? format(addDays(parseDateOnlyOrThrow(course.date), 1), DATE_ONLY_FORMAT)
		: course.date;
}
