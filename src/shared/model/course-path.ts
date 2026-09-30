const COURSE_ID_PATTERN = /^[1-9]\d{0,17}$/;

export function buildCoursePath(courseId: number, query = "") {
	const path = `/courses/${String(courseId)}`;
	return query === "" ? path : `${path}?${query}`;
}

export function buildCourseSavedPath(courseId: number) {
	return `${buildCoursePath(courseId)}/saved`;
}

export function parseCourseId(value: string) {
	return COURSE_ID_PATTERN.test(value) ? Number(value) : null;
}
