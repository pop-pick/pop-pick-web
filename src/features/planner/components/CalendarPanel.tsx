"use client";

import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import { ko } from "react-day-picker/locale";

import { DATE_ONLY_FORMAT, parseDateOnly, SEOUL_TIME_ZONE } from "@/shared/lib/date";

import { CalendarChevron } from "./CalendarChevron";

interface CalendarPanelProps {
	selectedDate: string | null;
	minDate: string;
	onSelect: (date: string) => void;
}

const CALENDAR_COMPONENTS = { Chevron: CalendarChevron };

const CALENDAR_FORMATTERS = {
	formatCaption: (month: Date) => format(month, "yyyy년 M월"),
	formatWeekdayName: (weekday: Date) => format(weekday, "EEEEE", { locale: ko })
};

const CALENDAR_CLASS_NAMES = {
	root: "w-full px-6 pt-6.75 pb-5.5",
	months: "flex",
	month: "flex w-full flex-wrap items-center justify-between",
	month_caption: "flex",
	caption_label: "rounded-xl border border-divider-2 px-3 py-1 text-b2-16 text-text-1",
	button_previous:
		"flex size-6 items-center justify-center rounded-md text-icon-2 focus-ring transition-colors not-aria-disabled:hover:bg-bg-3 aria-disabled:text-icon-disabled",
	button_next:
		"flex size-6 items-center justify-center rounded-md text-icon-2 focus-ring transition-colors not-aria-disabled:hover:bg-bg-3 aria-disabled:text-icon-disabled",
	month_grid: "mt-5.5 w-full table-fixed border-collapse",
	weekday: "h-10 text-b3-12 text-text-5",
	day: "group h-10 p-0 text-center text-text-1",
	day_button:
		"mx-auto flex size-10 items-center justify-center rounded-xl border border-transparent text-b3-14 focus-ring transition-colors not-disabled:hover:bg-bg-2 group-aria-selected:border-primary group-aria-selected:bg-primary-subtle",
	disabled: "text-text-6",
	outside: "invisible"
};

export function CalendarPanel({ selectedDate, minDate, onSelect }: CalendarPanelProps) {
	const selectedDay = selectedDate === null ? undefined : (parseDateOnly(selectedDate) ?? undefined);
	const firstSelectableDate = parseDateOnly(minDate) ?? undefined;

	const handleSelect = (date: Date) => {
		onSelect(format(date, DATE_ONLY_FORMAT));
	};

	return (
		<DayPicker
			mode="single"
			required
			locale={ko}
			timeZone={SEOUL_TIME_ZONE}
			selected={selectedDay}
			defaultMonth={selectedDay ?? firstSelectableDate}
			startMonth={firstSelectableDate}
			disabled={firstSelectableDate === undefined ? undefined : { before: firstSelectableDate }}
			autoFocus
			navLayout="around"
			formatters={CALENDAR_FORMATTERS}
			components={CALENDAR_COMPONENTS}
			classNames={CALENDAR_CLASS_NAMES}
			onSelect={handleSelect}
		/>
	);
}
