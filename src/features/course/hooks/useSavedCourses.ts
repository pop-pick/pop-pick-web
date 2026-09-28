"use client";

import { useEffect } from "react";

import { useSavedCoursesStore } from "../model/useSavedCoursesStore";

/** 서버 렌더에는 localStorage가 없어 첫 렌더를 비워 두고 마운트 뒤에 저장한 일정을 불러온다 */
export function useSavedCourses() {
	const courses = useSavedCoursesStore((state) => state.courses);
	const loadStatus = useSavedCoursesStore((state) => state.loadStatus);

	useEffect(() => {
		if (useSavedCoursesStore.getState().loadStatus === "loading") {
			void useSavedCoursesStore.persist.rehydrate();
		}
	}, []);

	return { courses, loadStatus };
}
