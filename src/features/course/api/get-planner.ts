import { queryOptions } from "@tanstack/react-query";

import { api } from "@/shared/api/client";
import { toSeoulDateOnly } from "@/shared/lib/date";
import type { CompanionType, TripDuration } from "@/shared/model/trip-preference";

import type { Course, CourseLeg, CourseStatus } from "../model/course";

export interface PlannerAreaResponse {
	id: number;
	name: string | null;
}

export interface PlannerStopResponse {
	visitOrder: number;
	popupId: number | null;
	title: string;
	address: string | null;
	latitude: number;
	longitude: number;
	imageUrl: string | null;
	openingHours: string | null;
	visitAt: string;
	stayMin: number;
	reason: string;
	nextTravelMin: number | null;
	nextTravelM: number | null;
}

export interface PlannerResponse {
	plannerId: number;
	status: CourseStatus;
	title: string;
	summary: string;
	area: PlannerAreaResponse;
	accompanyType: CompanionType;
	durationType: TripDuration;
	visitDate: string;
	startTime: string;
	endTime: string;
	totalMin: number;
	totalTravelM: number;
	requestNote: string | null;
	stops: PlannerStopResponse[];
	createdAt: string;
	confirmedAt: string | null;
}

function toLegs(stops: PlannerStopResponse[]) {
	const legs: CourseLeg[] = [];

	for (const stop of stops) {
		if (stop.nextTravelMin !== null && stop.nextTravelM !== null) {
			legs.push({ fromOrder: stop.visitOrder, minutes: stop.nextTravelMin, meters: stop.nextTravelM });
		}
	}

	return legs;
}

export function toCourse(planner: PlannerResponse) {
	const course: Course = {
		id: planner.plannerId,
		status: planner.status,
		title: planner.title,
		regionLabel: planner.area.name ?? "",
		areaId: planner.area.id,
		companion: planner.accompanyType,
		duration: planner.durationType,
		note: planner.requestNote ?? "",
		date: planner.visitDate,
		startAt: planner.startTime,
		endAt: planner.endTime,
		totalMinutes: planner.totalMin,
		stopCount: planner.stops.length,
		registeredAt: planner.confirmedAt === null ? null : toSeoulDateOnly(planner.confirmedAt),
		stops: planner.stops.map((stop) => ({
			order: stop.visitOrder,
			popupId: stop.popupId,
			title: stop.title,
			arriveAt: stop.visitAt,
			address: stop.address,
			reason: stop.reason,
			position: { lat: stop.latitude, lng: stop.longitude }
		})),
		legs: toLegs(planner.stops)
	};

	return course;
}

export function getPlanner(plannerId: number, signal?: AbortSignal) {
	return api.get<PlannerResponse>(`/api/v1/planners/${String(plannerId)}`, { signal });
}

export function courseDetailQueryOptions(courseId: number) {
	return queryOptions({
		queryKey: ["course", "detail", courseId],
		queryFn: async ({ signal }) => toCourse(await getPlanner(courseId, signal))
	});
}
