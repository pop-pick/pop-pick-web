import { screen, within } from "@testing-library/react";
import type { UserEvent } from "@testing-library/user-event";

export interface RequiredConditions {
	area: string;
	companion: string;
	/** "yyyy-MM-dd" */
	date: string;
	/** "HH:mm" */
	startAt: string;
	duration: RegExp;
}

export const DEFAULT_CONDITIONS: RequiredConditions = {
	area: "성수",
	companion: "친구와",
	date: "2026-10-03",
	startAt: "14:00",
	duration: /반나절/
};

const DATE_BUTTON_NAME = /^날짜 선택 (YYYY-MM-DD|\d{4}-\d{2}-\d{2})$/;

function toCalendarDayName(date: string) {
	const [year, month, day] = date.split("-").map(Number);
	return new RegExp(`${String(year)}년 ${String(month)}월 ${String(day)}일`);
}

export async function waitForPlannerForm() {
	return screen.findByRole("button", { name: "AI 코스 생성하기" });
}

export function getOptionGroup(title: string) {
	return screen.queryByRole("radiogroup", { name: title }) ?? screen.getByRole("group", { name: title });
}

export function getDateButton() {
	return screen.getByRole("button", { name: DATE_BUTTON_NAME });
}

export function getStartTimeButton() {
	return screen.getByRole("button", { name: /시작 시간/ });
}

export async function pickDate(user: UserEvent, date: string) {
	await user.click(getDateButton());
	const calendar = await screen.findByRole("dialog", { name: "날짜 선택 달력" });
	await user.click(within(calendar).getByRole("button", { name: toCalendarDayName(date) }));
}

export async function openStartTimes(user: UserEvent) {
	await user.click(getStartTimeButton());
	const listbox = await screen.findByRole("listbox");

	return within(listbox)
		.getAllByRole("option")
		.map((option) => option.textContent);
}

export async function pickStartTime(user: UserEvent, startAt: string) {
	await user.click(getStartTimeButton());
	await user.click(await screen.findByRole("option", { name: startAt }));
}

export async function fillRequiredConditions(user: UserEvent, conditions: Partial<RequiredConditions> = {}) {
	const { area, companion, date, startAt, duration } = { ...DEFAULT_CONDITIONS, ...conditions };

	await user.click(within(getOptionGroup("지역")).getByRole("radio", { name: area }));
	await user.click(within(getOptionGroup("동행 유형")).getByRole("radio", { name: companion }));
	await pickDate(user, date);
	await pickStartTime(user, startAt);
	await user.click(within(getOptionGroup("가능한 소요 시간")).getByRole("radio", { name: duration }));
}

export async function submitCourse(user: UserEvent) {
	await user.click(screen.getByRole("button", { name: "AI 코스 생성하기" }));
}
