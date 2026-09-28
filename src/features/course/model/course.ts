import type { KakaoLatLngLiteral } from "@/shared/lib/kakao-map/kakao-map-utils";

export interface CourseStop {
	order: number;
	popupId: number;
	title: string;
	/** "HH:mm" */
	arriveAt: string;
	address: string | null;
	waitMinutes: number | null;
	description: string | null;
	position: KakaoLatLngLiteral;
}

export interface CourseLeg {
	fromOrder: number;
	minutes: number;
	meters: number;
}

export interface Course {
	id: number;
	title: string;
	regionLabel: string;
	/** "YYYY-MM-DD" */
	date: string;
	/** "HH:mm" */
	startAt: string;
	/** "HH:mm" */
	endAt: string;
	stops: CourseStop[];
	legs: CourseLeg[];
	/** "YYYY-MM-DD". 저장 전이면 null */
	savedAt: string | null;
	/** "YYYY-MM-DD". 취소하지 않았으면 null */
	cancelledAt: string | null;
}
