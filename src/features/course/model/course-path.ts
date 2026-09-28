const COURSE_ID_PATTERN = /^[1-9]\d*$/;

import { PLANNER_NEW_PATH } from "@/shared/model/planner-path";

export function buildCoursePath(courseId: number) {
	return `/courses/${String(courseId)}`;
}

/** 코스 응답에 입력 조건이 오기 전까지 결과 주소가 넘겨받은 조건 쿼리를 조건 입력으로 그대로 돌려준다 */
export function buildRegeneratePath(requestQuery: string) {
	return requestQuery === "" ? PLANNER_NEW_PATH : `${PLANNER_NEW_PATH}?${requestQuery}`;
}

export function buildCourseSavedPath(courseId: number) {
	return `${buildCoursePath(courseId)}/saved`;
}

export function parseCourseId(value: string) {
	return COURSE_ID_PATTERN.test(value) ? Number(value) : null;
}
