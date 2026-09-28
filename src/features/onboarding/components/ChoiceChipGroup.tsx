import type { Ref } from "react";

import { ChoiceChip } from "@/shared/ui/ChoiceChip";

import { EMPTY_OPTIONS_MESSAGE, MULTIPLE_CHOICE_HINT } from "../model/messages";

export interface ChoiceOption<T extends string | number> {
	value: T;
	label: string;
}

interface ChoiceChipGroupProps<T extends string | number> {
	legend: string;
	name: string;
	mode: "single" | "multiple";
	options: readonly ChoiceOption<T>[];
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
	const handleChange = (value: T) => () => {
		onSelect(value);
	};

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
				<div className="grid grid-cols-2 gap-1.75">
					{options.map((option) => (
						<ChoiceChip
							key={option.value}
							type={mode === "single" ? "radio" : "checkbox"}
							name={name}
							value={String(option.value)}
							label={option.label}
							checked={selectedValues.includes(option.value)}
							onChange={handleChange(option.value)}
						/>
					))}
				</div>
			)}
		</fieldset>
	);
}
