"use client";

import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import { ko } from "react-day-picker/locale";

import { DATE_ONLY_FORMAT, parseDateOnly, parseDateOnlyOrThrow, SEOUL_TIME_ZONE } from "@/shared/lib/date";

import { CalendarChevron } from "./CalendarChevron";

interface CalendarPanelProps {
	selectedDate: string | null;
	minDate: string;
	maxDate: string;
	onSelect: (date: string) => void;
}

const CALENDAR_COMPONENTS = { Chevron: CalendarChevron };

const CALENDAR_FORMATTERS = {
	formatCaption: (month: Date) => format(month, "yyyy년 M월"),
	formatWeekdayName: (weekday: Date) => format(weekday, "EEEEE", { locale: ko })
};

const NAV_BUTTON_CLASS =
	"mx-0.5 flex size-6 items-center justify-center rounded-md text-icon-disabled focus-ring transition-colors not-aria-disabled:hover:bg-bg-3 not-aria-disabled:hover:text-icon-2 aria-disabled:opacity-40";

const CALENDAR_CLASS_NAMES = {
	root: "w-full px-5.5 pt-6.75 pb-5.5",
	months: "flex",
	month: "flex w-full flex-wrap items-center justify-between",
	month_caption: "flex",
	caption_label: "flex h-9.75 items-center rounded-xl border border-divider-2 px-3 text-b2-16 text-text-1",
	button_previous: NAV_BUTTON_CLASS,
	button_next: NAV_BUTTON_CLASS,
	month_grid: "mt-5.5 w-full table-fixed border-collapse",
	weekday: "h-10 text-b2-12 text-text-5",
	day: "group h-10 p-0 text-center text-text-1 data-disabled:text-text-6",
	day_button:
		"mx-auto flex size-10 items-center justify-center rounded-xl border border-transparent text-b3-14 focus-ring transition-colors not-disabled:hover:bg-bg-2 group-aria-selected:border-primary group-aria-selected:bg-primary-subtle",
	outside: "invisible"
};

export function CalendarPanel({ selectedDate, minDate, maxDate, onSelect }: CalendarPanelProps) {
	const selectedDay = selectedDate === null ? undefined : (parseDateOnly(selectedDate) ?? undefined);
	const firstSelectableDate = parseDateOnlyOrThrow(minDate);
	const lastSelectableDate = parseDateOnlyOrThrow(maxDate);

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
			endMonth={lastSelectableDate}
			disabled={[{ before: firstSelectableDate }, { after: lastSelectableDate }]}
			autoFocus
			navLayout="around"
			formatters={CALENDAR_FORMATTERS}
			components={CALENDAR_COMPONENTS}
			classNames={CALENDAR_CLASS_NAMES}
			onSelect={handleSelect}
		/>
	);
}
