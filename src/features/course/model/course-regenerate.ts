import { buildPlannerNewPath, EMPTY_PLANNER_DRAFT, PLANNER_NEW_PATH } from "@/shared/model/planner-path";

import type { Course } from "./course";

export function buildRegenerateHref(course: Course, requestQuery: string) {
	if (requestQuery !== "") {
		return `${PLANNER_NEW_PATH}?${requestQuery}`;
	}

	return buildPlannerNewPath({
		...EMPTY_PLANNER_DRAFT,
		areaId: course.areaId,
		companion: course.companion,
		date: course.date,
		startAt: course.startAt,
		duration: course.duration,
		note: course.note
	});
}
