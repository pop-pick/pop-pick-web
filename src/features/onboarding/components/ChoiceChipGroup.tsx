import type { Ref } from "react";

import { ChoiceChipGrid, type ChoiceChipOption } from "@/shared/ui/ChoiceChipGrid";

import { EMPTY_OPTIONS_MESSAGE, MULTIPLE_CHOICE_HINT } from "../model/messages";

interface ChoiceChipGroupProps<T extends string | number> {
	legend: string;
	name: string;
	mode: "single" | "multiple";
	options: readonly ChoiceChipOption<T>[];
	selectedValues: readonly T[];
	onSelect: (value: T) => void;
	ref?: Ref<HTMLFieldSetElement>;
}

export function ChoiceChipGroup<T extends string | number>({
	legend,
	name,
	mode,
	options,
	selectedValues,
	onSelect,
	ref
}: ChoiceChipGroupProps<T>) {
	return (
		<fieldset ref={ref} tabIndex={-1}>
			<legend className="mb-4 flex w-full items-center justify-between text-b1-14 text-text-2">
				{legend}
				{mode === "multiple" && options.length > 0 && (
					<span className="text-caption text-text-4">{MULTIPLE_CHOICE_HINT}</span>
				)}
			</legend>
			{options.length === 0 && <p className="text-b3-14 text-text-4">{EMPTY_OPTIONS_MESSAGE}</p>}
			{options.length > 0 && (
				<ChoiceChipGrid
					type={mode === "single" ? "radio" : "checkbox"}
					name={name}
					options={options}
					selectedValues={selectedValues}
					onToggle={onSelect}
					isOddLastWide
				/>
			)}
		</fieldset>
	);
}
