import Link from "next/link";

import { buildPopupDetailPath } from "@/shared/model/popup-path";
import { SeparatedText } from "@/shared/ui/SeparatedText";

import type { Course } from "../model/course";
import { findLegFrom, formatLeg, toStopDetailParts } from "../model/course-format";

interface CourseTimelineProps {
	course: Course;
}

export function CourseTimeline({ course }: CourseTimelineProps) {
	return (
		<ol aria-label="방문 순서" className="relative flex flex-col">
			<span aria-hidden className="absolute top-6 bottom-0 left-5.5 w-0.5 bg-divider-2" />
			{course.stops.map((stop) => {
				const leg = findLegFrom(course, stop.order);
				const detailParts = toStopDetailParts(stop);

				return (
					<li key={stop.order} className="relative flex flex-col">
						<div className="flex items-start gap-3">
							<p className="w-11.75 shrink-0 rounded-lg bg-primary-subtle py-0.75 text-center text-b2-12 text-primary">
								<span className="sr-only">{`${String(stop.order)}번째, `}</span>
								<time>{stop.arriveAt}</time>
							</p>
							<Link
								href={buildPopupDetailPath(stop.popupId)}
								className="flex min-w-0 flex-1 flex-col gap-1 rounded-panel border border-divider-2 bg-bg-1 p-4 focus-ring transition-colors hover:bg-bg-2"
							>
								<span className="text-b1-14 text-text-1">{stop.title}</span>
								{detailParts.length > 0 && (
									<span className="text-b3-12 text-text-3">
										<SeparatedText parts={detailParts} />
									</span>
								)}
							</Link>
						</div>
						{leg !== null && <p className="ml-14.75 py-4 text-center text-b3-12 text-text-5">{formatLeg(leg)}</p>}
					</li>
				);
			})}
		</ol>
	);
}
