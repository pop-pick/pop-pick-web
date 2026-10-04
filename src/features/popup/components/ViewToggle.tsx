import * as m from "motion/react-m";
import { type KeyboardEvent, useRef } from "react";

import { resolveRovingIndex } from "@/shared/lib/roving-index";
import { EXPLORE_VIEW_LABELS, EXPLORE_VIEW_MODES, type ExploreViewMode } from "@/shared/model/explore-state";

interface ViewToggleProps {
	view: ExploreViewMode;
	onChange: (view: ExploreViewMode) => void;
}

const INDICATOR_TRANSITION = { type: "spring", bounce: 0.25, duration: 0.4 } as const;

export function ViewToggle({ view, onChange }: ViewToggleProps) {
	const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);

	const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
		const nextIndex = resolveRovingIndex(event.key, EXPLORE_VIEW_MODES.indexOf(view), EXPLORE_VIEW_MODES.length);
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
			<div className="relative flex gap-1">
				<div aria-hidden className="pointer-events-none absolute inset-y-0 -right-1 left-0">
					<m.span
						initial={false}
						animate={{ x: `${String(EXPLORE_VIEW_MODES.indexOf(view) * 100)}%` }}
						transition={INDICATOR_TRANSITION}
						className="block h-full w-1/2 pr-1"
					>
						<span className="block size-full rounded-lg bg-bg-1 shadow-subtle" />
					</m.span>
				</div>
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
							className="relative h-10 flex-1 rounded-lg text-h4 text-text-4 focus-ring transition-colors not-aria-checked:hover:text-text-2 aria-checked:text-text-1"
						>
							{EXPLORE_VIEW_LABELS[value]}
						</button>
					);
				})}
			</div>
		</div>
	);
}
