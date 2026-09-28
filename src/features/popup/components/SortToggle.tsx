"use client";

import { EXPLORE_SORT_LABELS, EXPLORE_SORTS, type ExploreSort } from "@/shared/model/explore-state";

interface SortToggleProps {
	sort: ExploreSort;
	onChange: (sort: ExploreSort) => void;
}

export function SortToggle({ sort, onChange }: SortToggleProps) {
	const handleSortClick = (value: ExploreSort) => () => {
		onChange(value);
	};

	return (
		<div role="group" aria-label="정렬" className="flex items-center gap-2">
			{EXPLORE_SORTS.map((value, index) => (
				<div key={value} className="flex items-center gap-2">
					{index > 0 && <span aria-hidden className="h-3 w-px bg-divider-3" />}
					<button
						type="button"
						aria-pressed={sort === value}
						onClick={handleSortClick(value)}
						className="-my-2 rounded-sm py-2 text-b2-14 text-text-5 focus-ring transition-colors not-aria-pressed:hover:text-text-3 aria-pressed:text-text-1"
					>
						{EXPLORE_SORT_LABELS[value]}
					</button>
				</div>
			))}
		</div>
	);
}
