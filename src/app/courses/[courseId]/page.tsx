import { notFound, redirect } from "next/navigation";

import { CourseRecommendation } from "@/features/course/components/CourseRecommendation";
import { SavedCourseView } from "@/features/course/components/SavedCourseView";
import { buildRegeneratePath, parseCourseId } from "@/features/course/model/course-path";
import { buildGeneratedCourse, PLACEHOLDER_GENERATED_COURSE_ID } from "@/features/course/model/placeholder-courses";
import { parseCourseRequestDraft, toCourseRequest } from "@/features/planner/model/course-request";
import { toUrlSearchParams } from "@/shared/lib/search-params";
import { TRIP_DURATION_STOP_COUNTS } from "@/shared/model/trip-preference";

export async function generateMetadata({ params }: PageProps<"/courses/[courseId]">) {
	const courseId = parseCourseId((await params).courseId);
	return { title: courseId === PLACEHOLDER_GENERATED_COURSE_ID ? "추천 동선" : "일정 상세" };
}

export default async function CoursePage({ params, searchParams }: PageProps<"/courses/[courseId]">) {
	const courseId = parseCourseId((await params).courseId);

	if (courseId === null) {
		notFound();
	}

	if (courseId !== PLACEHOLDER_GENERATED_COURSE_ID) {
		return <SavedCourseView courseId={courseId} view="detail" />;
	}

	const requestParams = toUrlSearchParams(await searchParams);
	const regenerateHref = buildRegeneratePath(requestParams.toString());
	const request = toCourseRequest(parseCourseRequestDraft(requestParams));

	if (request === null) {
		redirect(regenerateHref);
	}

	const course = buildGeneratedCourse({
		date: request.date,
		startAt: request.startAt,
		stopCount: TRIP_DURATION_STOP_COUNTS[request.duration]
	});

	return <CourseRecommendation course={course} regenerateHref={regenerateHref} />;
}
