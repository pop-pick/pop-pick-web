import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { RequireAuth } from "@/features/auth/components/RequireAuth";
import { CourseView } from "@/features/course/components/CourseView";
import { CourseViewSkeleton } from "@/features/course/components/CourseViewSkeleton";
import { buildCoursePath, parseCourseId } from "@/shared/model/course-path";

export const metadata: Metadata = {
	title: "코스"
};

export function generateStaticParams() {
	return [];
}

export default async function CoursePage({ params }: PageProps<"/courses/[courseId]">) {
	const courseId = parseCourseId((await params).courseId);

	if (courseId === null) {
		notFound();
	}

	return (
		<RequireAuth nextPath={buildCoursePath(courseId)} fallback={<CourseViewSkeleton />}>
			<Suspense fallback={<CourseViewSkeleton />}>
				<CourseView courseId={courseId} view="detail" />
			</Suspense>
		</RequireAuth>
	);
}
