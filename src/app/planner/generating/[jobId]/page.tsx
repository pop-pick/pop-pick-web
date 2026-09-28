import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { buildCoursePath } from "@/features/course/model/course-path";
import { PLACEHOLDER_GENERATED_COURSE_ID } from "@/features/course/model/placeholder-courses";
import { GeneratingView } from "@/features/planner/components/GeneratingView";
import {
	parseCourseRequestDraft,
	serializeCourseRequestDraft,
	toCourseRequest
} from "@/features/planner/model/course-request";
import { buildPlannerNewPath } from "@/features/planner/model/planner-path";
import { toUrlSearchParams } from "@/shared/lib/search-params";

export const metadata: Metadata = {
	title: "코스 만드는 중"
};

export default async function CourseGeneratingPage({ searchParams }: PageProps<"/planner/generating/[jobId]">) {
	const draft = parseCourseRequestDraft(toUrlSearchParams(await searchParams));
	const editHref = buildPlannerNewPath(draft);

	if (toCourseRequest(draft) === null) {
		redirect(editHref);
	}

	const resultHref = `${buildCoursePath(PLACEHOLDER_GENERATED_COURSE_ID)}?${serializeCourseRequestDraft(draft).toString()}`;

	return <GeneratingView editHref={editHref} resultHref={resultHref} />;
}
