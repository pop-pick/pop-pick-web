"use client";

import * as m from "motion/react-m";
import { type KeyboardEvent, useRef } from "react";

import { cn } from "@/shared/lib/cn";

import { EXPLORE_VIEW_LABELS, EXPLORE_VIEW_MODES, type ExploreViewMode } from "../model/explore-state";

interface ViewToggleProps {
	view: ExploreViewMode;
	onChange: (view: ExploreViewMode) => void;
}

const ARROW_STEPS: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1 };
const INDICATOR_TRANSITION = { type: "spring", bounce: 0.25, duration: 0.4 } as const;

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

export function ViewToggle({ view, onChange }: ViewToggleProps) {
	const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);

	const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
		const nextIndex = resolveNextIndex(event.key, EXPLORE_VIEW_MODES.indexOf(view), EXPLORE_VIEW_MODES.length);
		const nextView = nextIndex === null ? undefined : EXPLORE_VIEW_MODES[nextIndex];

		if (nextIndex === null || nextView === undefined) {
			return;
		}

		event.preventDefault();
		onChange(nextView);
		buttonsRef.current[nextIndex]?.focus();
	};

	const handleOptionClick = (value: ExploreViewMode) => () => {
		onChange(value);
	};

	return (
		<div role="radiogroup" aria-label="보기 방식" onKeyDown={handleKeyDown} className="rounded-xl bg-bg-2 p-1">
			<div className="relative flex">
				<m.span
					aria-hidden
					initial={false}
					animate={{ x: `${String(EXPLORE_VIEW_MODES.indexOf(view) * 100)}%` }}
					transition={INDICATOR_TRANSITION}
					className="absolute inset-y-0 left-0 w-1/2 rounded-lg bg-bg-1 shadow-subtle"
				/>
				{EXPLORE_VIEW_MODES.map((value, index) => {
					const isCurrent = view === value;

					return (
						<button
							key={value}
							ref={(element) => {
								buttonsRef.current[index] = element;
							}}
							type="button"
							role="radio"
							aria-checked={isCurrent}
							tabIndex={isCurrent ? 0 : -1}
							onClick={handleOptionClick(value)}
							className={cn(
								"relative h-10 flex-1 rounded-lg text-h4 focus-ring transition-colors",
								isCurrent ? "text-text-1" : "text-text-4 hover:text-text-2"
							)}
						>
							{EXPLORE_VIEW_LABELS[value]}
						</button>
					);
				})}
			</div>
		</div>
	);
}
