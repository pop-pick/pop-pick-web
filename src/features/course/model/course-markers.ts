import type { Course } from "./course";

const COURSE_PIN_ICON_PATH = "/pins/course.svg";

export function toCourseMarkers(course: Course) {
	return course.stops.map((stop) => ({
		id: String(stop.order),
		position: stop.position,
		title: `${String(stop.order)}. ${stop.title}`,
		variant: "icon" as const,
		iconUrl: COURSE_PIN_ICON_PATH
	}));
}
