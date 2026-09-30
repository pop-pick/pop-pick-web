import type { ComponentProps, ComponentType, ReactNode } from "react";

import CalendarIcon from "@/shared/assets/icons/calendar.svg";
import ClockIcon from "@/shared/assets/icons/clock.svg";
import TicketIcon from "@/shared/assets/icons/ticket.svg";
import { SeparatedText } from "@/shared/ui/SeparatedText";
import { SvgIcon } from "@/shared/ui/SvgIcon";

import type { CourseSummary } from "../model/course";
import { formatCourseDate, toCourseDurationParts } from "../model/course-format";

interface CourseSummaryRowsProps {
	course: CourseSummary;
}

interface SummaryRow {
	icon: ComponentType<ComponentProps<"svg">>;
	label: string;
	value: ReactNode;
}

export function CourseSummaryRows({ course }: CourseSummaryRowsProps) {
	const rows: SummaryRow[] = [
		{ icon: ClockIcon, label: "방문 날짜", value: formatCourseDate(course.date) },
		{ icon: TicketIcon, label: "코스 이름", value: course.title },
		{
			icon: CalendarIcon,
			label: "소요 시간",
			value: (
				<>
					총 소요시간 : <SeparatedText parts={toCourseDurationParts(course)} />
				</>
			)
		}
	];

	return (
		<dl className="flex flex-col gap-3">
			{rows.map((row) => (
				<div key={row.label} className="flex items-start gap-2">
					<dt className="flex shrink-0 pt-0.5">
						<SvgIcon icon={row.icon} size={16} className="text-icon-primary" />
						<span className="sr-only">{row.label}</span>
					</dt>
					<dd className="text-b3-14 break-keep text-text-2">{row.value}</dd>
				</div>
			))}
		</dl>
	);
}
