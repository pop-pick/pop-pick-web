"use client";

import * as m from "motion/react-m";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";

import { buildCourseTabId, COURSE_TAB_LABELS, COURSE_TABS, type CourseTab } from "../model/course-tab";

interface CourseTabsProps {
	tab: CourseTab;
	panelId: string;
	onChange: (tab: CourseTab) => void;
}

interface IndicatorBox {
	x: number;
	width: number;
}

const ARROW_STEPS: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1 };
const INDICATOR_TRANSITION = { type: "spring", bounce: 0.2, duration: 0.35 } as const;

function resolveNextIndex(key: string, currentIndex: number, count: number) {
	if (key === "Home") {
		return 0;
	}

	if (key === "End") {
		return count - 1;
	}

	const step = ARROW_STEPS[key];

	return step === undefined ? null : (currentIndex + step + count) % count;
}

export function CourseTabs({ tab, panelId, onChange }: CourseTabsProps) {
	const listRef = useRef<HTMLDivElement>(null);
	const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);
	const [indicator, setIndicator] = useState<IndicatorBox | null>(null);
	const currentIndex = COURSE_TABS.indexOf(tab);

	useEffect(() => {
		const list = listRef.current;
		const button = buttonsRef.current[currentIndex];

		if (!list || !button) {
			return;
		}

		const observer = new ResizeObserver(() => {
			setIndicator({ x: button.offsetLeft, width: button.offsetWidth });
		});

		observer.observe(list);

		return () => {
			observer.disconnect();
		};
	}, [currentIndex]);

	const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
		const nextIndex = resolveNextIndex(event.key, currentIndex, COURSE_TABS.length);
		const nextTab = nextIndex === null ? undefined : COURSE_TABS[nextIndex];

		if (nextIndex === null || nextTab === undefined) {
			return;
		}

		event.preventDefault();
		onChange(nextTab);
		buttonsRef.current[nextIndex]?.focus();
	};

	const handleTabClick = (value: CourseTab) => () => {
		onChange(value);
	};

	return (
		<div
			ref={listRef}
			role="tablist"
			aria-label="일정 구분"
			onKeyDown={handleKeyDown}
			className="relative flex gap-3 border-b border-divider-2 px-5"
		>
			{COURSE_TABS.map((value, index) => {
				const isCurrent = value === tab;

				return (
					<button
						key={value}
						ref={(element) => {
							buttonsRef.current[index] = element;
						}}
						id={buildCourseTabId(value)}
						type="button"
						role="tab"
						aria-selected={isCurrent}
						aria-controls={panelId}
						tabIndex={isCurrent ? 0 : -1}
						onClick={handleTabClick(value)}
						className="h-10 px-1 text-b2-16 text-text-4 focus-ring transition-colors not-aria-selected:hover:text-text-2 aria-selected:text-b1-16 aria-selected:text-primary"
					>
						{COURSE_TAB_LABELS[value]}
					</button>
				);
			})}
			{indicator !== null && (
				<m.span
					aria-hidden
					initial={false}
					animate={{ x: indicator.x, width: indicator.width }}
					transition={INDICATOR_TRANSITION}
					className="absolute -bottom-0.5 left-0 h-0.5 bg-primary"
				/>
			)}
		</div>
	);
}
