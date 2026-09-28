import { addDays, differenceInMinutes, format } from "date-fns";

import { DATE_ONLY_FORMAT, parseDateOnlyOrThrow, parseTimeOnlyOrThrow } from "@/shared/lib/date";

import type { Course } from "./course";

const MINUTES_PER_DAY = 24 * 60;

type CourseTime = Pick<Course, "date" | "startAt" | "endAt">;

/** 시작 시각이 늦으면 코스가 자정을 넘겨 끝 시각이 시작 시각보다 앞선다. 그때 끝은 다음 날이다 */
function isOvernightCourse({ startAt, endAt }: CourseTime) {
	return endAt < startAt;
}

export function toCourseMinutes(course: CourseTime) {
	const courseDate = parseDateOnlyOrThrow(course.date);
	const minutes = differenceInMinutes(
		parseTimeOnlyOrThrow(course.endAt, courseDate),
		parseTimeOnlyOrThrow(course.startAt, courseDate)
	);

	return isOvernightCourse(course) ? minutes + MINUTES_PER_DAY : minutes;
}

export function toCourseEndDate(course: CourseTime) {
	return isOvernightCourse(course)
		? format(addDays(parseDateOnlyOrThrow(course.date), 1), DATE_ONLY_FORMAT)
		: course.date;
}
