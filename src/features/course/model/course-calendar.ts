import { tz } from "@date-fns/tz";
import { format } from "date-fns";

import { SEOUL_TIME_ZONE } from "@/shared/lib/date";

import type { Course } from "./course";
import { toCourseEndDate } from "./course-time";

const UTC_STAMP_FORMAT = "yyyyMMdd'T'HHmmss'Z'";
const GOOGLE_CALENDAR_TEMPLATE_URL = "https://calendar.google.com/calendar/render";
const ICS_LINE_BREAK = "\r\n";
/** RFC 5545 3.1: 한 줄은 줄바꿈을 빼고 75옥텟을 넘지 않는다. 넘으면 CRLF와 공백 하나로 접는다 */
const ICS_MAX_LINE_OCTETS = 75;

function toCalendarDateTime(date: string, time: string) {
	return `${date.replaceAll("-", "")}T${time.replace(":", "")}00`;
}

function buildVisitOrderText(course: Course) {
	return course.stops.map((stop) => `${String(stop.order)}. ${stop.arriveAt} ${stop.title}`).join("\n");
}

export function buildGoogleCalendarUrl(course: Course) {
	const params = new URLSearchParams({
		action: "TEMPLATE",
		text: course.title,
		dates: `${toCalendarDateTime(course.date, course.startAt)}/${toCalendarDateTime(toCourseEndDate(course), course.endAt)}`,
		ctz: SEOUL_TIME_ZONE,
		details: buildVisitOrderText(course)
	});

	return `${GOOGLE_CALENDAR_TEMPLATE_URL}?${params.toString()}`;
}

function escapeIcsText(text: string) {
	return text.replace(/[\;,]/g, (character) => `\\${character}`).replace(/\n/g, "\\n");
}

function foldIcsLine(line: string) {
	const encoder = new TextEncoder();
	const segments: string[] = [];
	let current = "";
	let currentOctets = 0;

	for (const character of line) {
		const octets = encoder.encode(character).length;
		const limit = segments.length === 0 ? ICS_MAX_LINE_OCTETS : ICS_MAX_LINE_OCTETS - 1;

		if (currentOctets + octets > limit) {
			segments.push(current);
			current = "";
			currentOctets = 0;
		}

		current += character;
		currentOctets += octets;
	}

	segments.push(current);

	return segments.join(`${ICS_LINE_BREAK} `);
}

export function buildCourseIcs(course: Course, stampedAt: Date) {
	const lines = [
		"BEGIN:VCALENDAR",
		"VERSION:2.0",
		"PRODID:-//POP PICK//Course//KO",
		"CALSCALE:GREGORIAN",
		"METHOD:PUBLISH",
		"BEGIN:VTIMEZONE",
		`TZID:${SEOUL_TIME_ZONE}`,
		"BEGIN:STANDARD",
		"DTSTART:19700101T000000",
		"TZOFFSETFROM:+0900",
		"TZOFFSETTO:+0900",
		"TZNAME:KST",
		"END:STANDARD",
		"END:VTIMEZONE",
		"BEGIN:VEVENT",
		`UID:course-${String(course.id)}@pop-pick`,
		`DTSTAMP:${format(stampedAt, UTC_STAMP_FORMAT, { in: tz("UTC") })}`,
		`DTSTART;TZID=${SEOUL_TIME_ZONE}:${toCalendarDateTime(course.date, course.startAt)}`,
		`DTEND;TZID=${SEOUL_TIME_ZONE}:${toCalendarDateTime(toCourseEndDate(course), course.endAt)}`,
		`SUMMARY:${escapeIcsText(course.title)}`,
		`LOCATION:${escapeIcsText(course.regionLabel)}`,
		`DESCRIPTION:${escapeIcsText(buildVisitOrderText(course))}`,
		"END:VEVENT",
		"END:VCALENDAR"
	];

	return `${lines.map(foldIcsLine).join(ICS_LINE_BREAK)}${ICS_LINE_BREAK}`;
}

export function buildCourseIcsFileName(course: Course) {
	return `pop-pick-course-${String(course.id)}.ics`;
}
