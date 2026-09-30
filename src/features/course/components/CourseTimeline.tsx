import type { Course } from "../model/course";
import { findLegFrom, formatLeg } from "../model/course-format";
import { CourseStopCard } from "./CourseStopCard";

interface CourseTimelineProps {
	course: Course;
}

export function CourseTimeline({ course }: CourseTimelineProps) {
	return (
		<ol aria-label="방문 순서" className="relative flex flex-col">
			<span aria-hidden className="absolute top-6 bottom-0 left-5.5 w-0.5 bg-divider-2" />
			{course.stops.map((stop) => {
				const leg = findLegFrom(course, stop.order);

				return (
					<li key={stop.order} className="relative flex flex-col">
						<div className="flex items-start gap-3">
							<p className="w-11.75 shrink-0 rounded-lg bg-primary-subtle py-0.75 text-center text-b2-12 text-primary">
								<span className="sr-only">{`${String(stop.order)}번째, `}</span>
								<time>{stop.arriveAt}</time>
							</p>
							<CourseStopCard stop={stop} />
						</div>
						{leg !== null && <p className="ml-14.75 py-4 text-center text-b3-12 text-text-5">{formatLeg(leg)}</p>}
					</li>
				);
			})}
		</ol>
	);
}
