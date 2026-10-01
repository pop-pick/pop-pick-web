import type { KakaoLatLngLiteral } from "@/shared/lib/kakao-map/kakao-map-utils";
import type { CompanionType, TripDuration } from "@/shared/model/trip-preference";

export type CourseStatus = "DRAFT" | "SCHEDULED" | "CANCELED";

export interface CourseStop {
	order: number;
	/** 팝업이 지워졌으면 null이고 나머지는 저장할 때의 값이다 */
	popupId: number | null;
	title: string;
	/** "HH:mm" */
	arriveAt: string;
	address: string | null;
	position: KakaoLatLngLiteral;
}

export interface CourseLeg {
	fromOrder: number;
	minutes: number;
	meters: number;
}

export interface CourseSummary {
	id: number;
	status: CourseStatus;
	title: string;
	/** "yyyy-MM-dd" */
	date: string;
	/** "HH:mm" */
	startAt: string;
	/** "HH:mm" */
	endAt: string;
	totalMinutes: number;
	stopCount: number;
	/** 서울 기준 "yyyy-MM-dd". 저장 전이면 null */
	registeredAt: string | null;
}

export interface Course extends CourseSummary {
	regionLabel: string;
	areaId: number;
	companion: CompanionType;
	duration: TripDuration;
	note: string;
	stops: CourseStop[];
	legs: CourseLeg[];
}
