import Link from "next/link";

import type { Course } from "../model/course";
import { CourseMap } from "./CourseMap";
import { CourseTimeline } from "./CourseTimeline";
import { SaveCourseButton } from "./SaveCourseButton";

interface CourseRecommendationProps {
	course: Course;
	regenerateHref: string;
}

export function CourseRecommendation({ course, regenerateHref }: CourseRecommendationProps) {
	return (
		<main className="flex flex-1 flex-col pt-19 pb-tab-bar-clearance">
			<header className="flex flex-col gap-3 px-5 text-center">
				<h1 className="text-h1 whitespace-pre-line text-text-1">{`${course.regionLabel}\n추천 동선입니다.`}</h1>
				<p className="text-b2-14 text-text-4">팝픽이 계획한 맞춤 동선으로 팝업을 즐겨보세요.</p>
			</header>
			<div className="mt-8">
				<CourseMap course={course} />
			</div>
			<div className="mt-5 px-5">
				<CourseTimeline course={course} />
			</div>
			<div className="mt-8 flex flex-col gap-2.5 px-5">
				<SaveCourseButton course={course} />
				<Link
					href={regenerateHref}
					className="flex h-10.5 items-center justify-center rounded-xl text-b1-14 text-text-4 focus-ring transition-colors hover:bg-bg-2"
				>
					다시 생성하기
				</Link>
			</div>
		</main>
	);
}
