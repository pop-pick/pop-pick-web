import { PLANNER_NEW_PATH } from "@/shared/model/planner-path";

import { type CourseRequestDraft, serializeCourseRequestDraft } from "./course-request";

/** 코스 API가 없어 생성 작업 id를 받지 못한다. API가 붙으면 응답의 jobId로 바꾼다 */
export const PENDING_COURSE_JOB_ID = "pending";

function toQuerySuffix(draft: CourseRequestDraft) {
	const query = serializeCourseRequestDraft(draft).toString();
	return query === "" ? "" : `?${query}`;
}

export function buildPlannerNewPath(draft: CourseRequestDraft) {
	return `${PLANNER_NEW_PATH}${toQuerySuffix(draft)}`;
}

export function buildGeneratingPath(jobId: string, draft: CourseRequestDraft) {
	return `/planner/generating/${encodeURIComponent(jobId)}${toQuerySuffix(draft)}`;
}

/** loginHref는 next 값이 PLANNER_NEW_PATH로 끝나는 로그인 주소여야 한다. 그 끝에 조건 쿼리를 인코딩해 잇는다 */
export function appendDraftToLoginHref(loginHref: string, draft: CourseRequestDraft) {
	return `${loginHref}${encodeURIComponent(toQuerySuffix(draft))}`;
}
