import type { Course } from "../model/course";
import { prefixRegion } from "../model/course-format";
import { CourseDetailActions } from "./CourseDetailActions";
import { CourseMap } from "./CourseMap";
import { CourseSummaryRows } from "./CourseSummaryRows";
import { CourseTimeline } from "./CourseTimeline";

interface CourseDetailProps {
	course: Course;
}

export function CourseDetail({ course }: CourseDetailProps) {
	return (
		<main className="flex flex-1 flex-col pt-9">
			<h1 className="px-5 text-center text-h3 text-text-1">일정 요약</h1>
			<div className="mx-5 mt-6.25 rounded-2xl bg-bg-2 p-4">
				<CourseSummaryRows course={course} />
			</div>
			<section aria-labelledby="course-route-title" className="mt-6 flex flex-col">
				<h2 id="course-route-title" className="px-5 text-h3 text-text-1">
					{prefixRegion(course.regionLabel, "맞춤 추천 동선")}
				</h2>
				<div className="mt-5">
					<CourseMap course={course} />
				</div>
				<div className="mt-5 px-5">
					<CourseTimeline course={course} />
				</div>
			</section>
			<div className="mt-8 px-5">
				<CourseDetailActions courseId={course.id} canDelete={course.status === "SCHEDULED"} />
			</div>
		</main>
	);
}
