"use client";

import { type KeyboardEvent, useRef } from "react";

import { cn } from "@/shared/lib/cn";

import { EXPLORE_VIEW_LABELS, EXPLORE_VIEW_MODES, type ExploreViewMode } from "../model/explore-state";

interface ViewToggleProps {
	view: ExploreViewMode;
	onChange: (view: ExploreViewMode) => void;
}

const ARROW_STEPS: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1 };

function resolveNextIndex(key: string, current: number, count: number) {
	if (key === "Home") {
		return 0;
	}

	if (key === "End") {
		return count - 1;
	}

	const step = ARROW_STEPS[key];

	return step === undefined ? null : (current + step + count) % count;
}

export function ViewToggle({ view, onChange }: ViewToggleProps) {
	const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);

	const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
		const nextIndex = resolveNextIndex(event.key, EXPLORE_VIEW_MODES.indexOf(view), EXPLORE_VIEW_MODES.length);
		const next = nextIndex === null ? undefined : EXPLORE_VIEW_MODES[nextIndex];

		if (nextIndex === null || next === undefined) {
			return;
		}

		event.preventDefault();
		onChange(next);
		buttonsRef.current[nextIndex]?.focus();
	};

	const handleOptionClick = (value: ExploreViewMode) => () => {
		onChange(value);
	};

	return (
		<div role="radiogroup" aria-label="보기 방식" onKeyDown={handleKeyDown} className="flex rounded-xl bg-zinc-100 p-1">
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
							"rounded-lg px-3 py-1.5 text-sm font-medium focus-ring transition-colors",
							isCurrent ? "bg-white text-zinc-900 shadow-sm hover:bg-zinc-50" : "text-zinc-500 hover:text-zinc-700"
						)}
					>
						{EXPLORE_VIEW_LABELS[value]}
					</button>
				);
			})}
		</div>
	);
}
