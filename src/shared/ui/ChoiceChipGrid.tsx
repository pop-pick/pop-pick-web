import { tv } from "@/shared/lib/tv";

import { ChoiceChip } from "./ChoiceChip";

const choiceChipGridVariants = tv({
	base: "grid grid-cols-2 gap-1.75",
	variants: {
		isOddLastWide: {
			true: "*:last:odd:col-span-2"
		}
	}
});

export interface ChoiceChipOption<T extends string | number> {
	value: T;
	label: string;
}

interface ChoiceChipGridProps<T extends string | number> {
	type: "radio" | "checkbox";
	name: string;
	options: readonly ChoiceChipOption<T>[];
	selectedValues: readonly T[];
	onToggle: (value: T) => void;
	/** 주면 그리드가 radiogroup이나 group이 되어 이 id의 제목으로 불린다. fieldset 안에 둘 때는 비운다 */
	labelledBy?: string;
	isOddLastWide?: boolean;
}

export function ChoiceChipGrid<T extends string | number>({
	type,
	name,
	options,
	selectedValues,
	onToggle,
	labelledBy,
	isOddLastWide = false
}: ChoiceChipGridProps<T>) {
	const groupRole = type === "radio" ? "radiogroup" : "group";

	const handleChange = (value: T) => () => {
		onToggle(value);
	};

	return (
		<div
			role={labelledBy === undefined ? undefined : groupRole}
			aria-labelledby={labelledBy}
			className={choiceChipGridVariants({ isOddLastWide })}
		>
			{options.map((option) => (
				<ChoiceChip
					key={option.value}
					type={type}
					name={name}
					value={String(option.value)}
					label={option.label}
					checked={selectedValues.includes(option.value)}
					onChange={handleChange(option.value)}
				/>
			))}
		</div>
	);
}
