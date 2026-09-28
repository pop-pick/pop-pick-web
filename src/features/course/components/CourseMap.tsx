"use client";

import { useMemo } from "react";

import { KakaoMap } from "@/shared/lib/kakao-map/KakaoMap";

import type { Course } from "../model/course";
import { toCourseMarkers } from "../model/course-markers";

interface CourseMapProps {
	course: Course;
}

export function CourseMap({ course }: CourseMapProps) {
	const markers = useMemo(() => toCourseMarkers(course), [course]);
	const positions = useMemo(() => markers.map((marker) => marker.position), [markers]);

	return (
		<KakaoMap
			fitTo={positions}
			markers={markers}
			label={`${course.regionLabel} 코스 지도, 팝업 ${String(markers.length)}곳`}
			className="h-35 rounded-none"
		/>
	);
}
