"use client";

import { type FocusEvent, type KeyboardEvent, type MouseEvent, useId, useRef, useState } from "react";

import CalendarDotsIcon from "@/shared/assets/icons/calendar-dots.svg";
import { getSeoulToday } from "@/shared/lib/date";
import { tv } from "@/shared/lib/tv";
import { DropdownPanel } from "@/shared/ui/DropdownPanel";
import { SvgIcon } from "@/shared/ui/SvgIcon";

import { CalendarPanel } from "./CalendarPanel";

interface DateFieldProps {
	labelId: string;
	date: string | null;
	onChange: (date: string) => void;
}

const PLACEHOLDER_LABEL = "YYYY-MM-DD";

const dateFieldButtonVariants = tv({
	base: "flex h-12 w-full items-center justify-between rounded-xl border border-divider-2 bg-bg-1 py-3 pr-3 pl-4 text-b2-14 focus-ring transition-colors hover:bg-bg-2",
	variants: {
		hasValue: {
			true: "text-text-1",
			false: "text-text-4"
		}
	}
});

/** 달력 판은 날짜와 시작 시간 두 칸을 덮는다. 가장 가까운 position 조상이 그 두 칸을 감싼 줄이어야 한다 */
export function DateField({ labelId, date, onChange }: DateFieldProps) {
	const [isOpen, setIsOpen] = useState(false);
	const buttonRef = useRef<HTMLButtonElement>(null);
	const panelId = useId();

	const closePanel = (shouldFocusButton: boolean) => {
		setIsOpen(false);

		if (shouldFocusButton) {
			buttonRef.current?.focus();
		}
	};

	const handleButtonClick = () => {
		setIsOpen((wasOpen) => !wasOpen);
	};

	const handleButtonMouseDown = (event: MouseEvent<HTMLButtonElement>) => {
		if (isOpen) {
			event.preventDefault();
		}
	};

	const handleContainerBlur = (event: FocusEvent<HTMLDivElement>) => {
		if (!event.currentTarget.contains(event.relatedTarget)) {
			closePanel(false);
		}
	};

	const handleContainerKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
		if (isOpen && event.key === "Escape") {
			event.preventDefault();
			closePanel(true);
		}
	};

	const handleDateSelect = (selectedDate: string) => {
		closePanel(true);
		onChange(selectedDate);
	};

	return (
		<div onBlur={handleContainerBlur} onKeyDown={handleContainerKeyDown} className="min-w-0 flex-1">
			<button
				ref={buttonRef}
				type="button"
				aria-haspopup="dialog"
				aria-expanded={isOpen}
				aria-controls={isOpen ? panelId : undefined}
				aria-labelledby={`${labelId} ${panelId}-value`}
				onMouseDown={handleButtonMouseDown}
				onClick={handleButtonClick}
				className={dateFieldButtonVariants({ hasValue: date !== null })}
			>
				<span id={`${panelId}-value`}>{date ?? PLACEHOLDER_LABEL}</span>
				<SvgIcon icon={CalendarDotsIcon} size={24} className="text-icon-disabled" />
			</button>
			<DropdownPanel
				isOpen={isOpen}
				id={panelId}
				role="dialog"
				aria-label="날짜 선택 달력"
				className="absolute inset-x-0 top-0 z-30 rounded-xl bg-bg-1 shadow-sheet"
			>
				<CalendarPanel selectedDate={date} minDate={getSeoulToday()} onSelect={handleDateSelect} />
			</DropdownPanel>
		</div>
	);
}
