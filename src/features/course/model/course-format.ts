import { format } from "date-fns";
import { ko } from "date-fns/locale";

import { parseDateOnlyOrThrow } from "@/shared/lib/date";

import type { Course, CourseLeg, CourseStop } from "./course";
import { toCourseMinutes } from "./course-time";

const METERS_PER_KILOMETER = 1000;

function formatDuration(totalMinutes: number) {
	const hours = Math.floor(totalMinutes / 60);
	const minutes = totalMinutes % 60;

	if (hours === 0) {
		return `${String(minutes)}분`;
	}

	return minutes === 0 ? `${String(hours)}시간` : `${String(hours)}시간 ${String(minutes)}분`;
}

export function formatCourseDate(date: string) {
	return format(parseDateOnlyOrThrow(date), "yyyy년 M월 d일 (EEEEE)", { locale: ko });
}

/** "총 소요시간 : " 뒤에 구분점으로 이어 그릴 두 조각을 돌려준다. 구분점은 화면이 `SeparatedText`로 넣는다 */
export function toCourseDurationParts(course: Course) {
	const duration = formatDuration(toCourseMinutes(course));
	return [`약 ${duration}(${course.startAt} ~ ${course.endAt}`, `팝업 ${String(course.stops.length)}곳)`];
}

export function toStopDetailParts(stop: CourseStop) {
	const parts = [stop.address, stop.waitMinutes === null ? null : `대기시간 예상 ${String(stop.waitMinutes)}분`].filter(
		(part) => part !== null
	);

	if (parts.length > 0) {
		return parts;
	}

	return stop.description === null ? [] : [stop.description];
}

function formatDistance(meters: number) {
	return meters < METERS_PER_KILOMETER ? `${String(meters)}m` : `${(meters / METERS_PER_KILOMETER).toFixed(1)}km`;
}

export function formatLeg(leg: CourseLeg) {
	return `도보 ${String(leg.minutes)}분 (${formatDistance(leg.meters)})`;
}

export function findLegFrom(course: Course, order: number) {
	return course.legs.find((leg) => leg.fromOrder === order) ?? null;
}
