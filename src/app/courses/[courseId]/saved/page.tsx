import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { RequireAuth } from "@/features/auth/components/RequireAuth";
import { CourseView } from "@/features/course/components/CourseView";
import { CourseViewSkeleton } from "@/features/course/components/CourseViewSkeleton";
import { buildCourseSavedPath, parseCourseId } from "@/shared/model/course-path";

export const metadata: Metadata = {
	title: "플래너 등록 완료"
};

export function generateStaticParams() {
	return [];
}

export default async function CourseSavedPage({ params }: PageProps<"/courses/[courseId]/saved">) {
	const courseId = parseCourseId((await params).courseId);

	if (courseId === null) {
		notFound();
	}

	return (
		<RequireAuth nextPath={buildCourseSavedPath(courseId)} fallback={<CourseViewSkeleton />}>
			<Suspense fallback={<CourseViewSkeleton />}>
				<CourseView courseId={courseId} view="saved" />
			</Suspense>
		</RequireAuth>
	);
}
