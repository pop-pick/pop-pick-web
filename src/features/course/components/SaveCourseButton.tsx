"use client";

import { useRouter } from "next/navigation";

import { useSavedCourses } from "../hooks/useSavedCourses";
import type { Course } from "../model/course";
import { buildCourseSavedPath } from "../model/course-path";
import { useSavedCoursesStore } from "../model/useSavedCoursesStore";

interface SaveCourseButtonProps {
	course: Course;
}

export function SaveCourseButton({ course }: SaveCourseButtonProps) {
	const router = useRouter();
	const { loadStatus } = useSavedCourses();
	const saveCourse = useSavedCoursesStore((state) => state.saveCourse);
	const canSave = loadStatus === "ready";

	const handleSave = () => {
		const savedCourseId = saveCourse(course);
		router.replace(buildCourseSavedPath(savedCourseId));
	};

	return (
		<button
			type="button"
			disabled={!canSave}
			onClick={handleSave}
			className="h-10.5 rounded-xl bg-primary text-b1-14 text-text-w focus-ring transition-colors not-disabled:hover:bg-primary-strong disabled:bg-bg-4 disabled:text-text-6"
		>
			내 플래너에 저장하기
		</button>
	);
}
