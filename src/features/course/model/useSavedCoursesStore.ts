import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { getSeoulToday } from "@/shared/lib/date";

import type { Course } from "./course";

const STORAGE_KEY = "pp-saved-courses";
const FIRST_SAVED_COURSE_ID = 1000;

export type SavedCoursesLoadStatus = "loading" | "ready" | "failed";

interface SavedCoursesState {
	courses: Course[];
	loadStatus: SavedCoursesLoadStatus;
	saveCourse: (course: Course) => number;
	cancelCourse: (courseId: number) => void;
}

/** 복원 전에 쓰면 persist가 빈 목록 위에 쓴 값을 저장해 이전 일정을 지운다. 복원이 끝나기 전의 쓰기는 호출하는 쪽의 결함이다 */
function verifyLoaded(loadStatus: SavedCoursesLoadStatus) {
	if (loadStatus !== "ready") {
		throw new Error(`[course] 저장한 일정을 불러오기 전에 고치려 했다: ${loadStatus}`);
	}
}

/** 코스 API가 붙기 전까지 저장한 일정을 이 브라우저에만 남긴다. API가 붙으면 내 일정 쿼리와 저장, 삭제 뮤테이션으로 바꾸고 지운다 */
export const useSavedCoursesStore = create<SavedCoursesState>()(
	persist(
		(set, get) => ({
			courses: [],
			loadStatus: "loading",
			saveCourse: (course) => {
				const { courses, loadStatus } = get();
				verifyLoaded(loadStatus);

				const id = Math.max(FIRST_SAVED_COURSE_ID - 1, ...courses.map((saved) => saved.id)) + 1;
				const savedCourse = { ...course, id, savedAt: getSeoulToday(), cancelledAt: null };

				set({ courses: [...courses, savedCourse] });

				return id;
			},
			cancelCourse: (courseId) => {
				verifyLoaded(get().loadStatus);

				const cancelledAt = getSeoulToday();

				set({
					courses: get().courses.map((course) => (course.id === courseId ? { ...course, cancelledAt } : course))
				});
			}
		}),
		{
			name: STORAGE_KEY,
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({ courses: state.courses }),
			skipHydration: true,
			onRehydrateStorage: () => (_state, error) => {
				if (error !== undefined) {
					console.warn("[course] 저장한 일정을 불러오지 못했다", error);
					useSavedCoursesStore.setState({ loadStatus: "failed" });
					return;
				}

				useSavedCoursesStore.setState({ loadStatus: "ready" });
			}
		}
	)
);
