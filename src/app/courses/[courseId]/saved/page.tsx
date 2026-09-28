import { notFound } from "next/navigation";

import { SavedCourseView } from "@/features/course/components/SavedCourseView";
import { parseCourseId } from "@/features/course/model/course-path";

export const metadata = {
	title: "플래너 등록 완료"
};

export default async function CourseSavedPage({ params }: PageProps<"/courses/[courseId]/saved">) {
	const courseId = parseCourseId((await params).courseId);

	if (courseId === null) {
		notFound();
	}

	return <SavedCourseView courseId={courseId} view="registered" />;
}
