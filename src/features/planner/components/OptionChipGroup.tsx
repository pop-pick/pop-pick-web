import { ChoiceChip } from "@/shared/ui/ChoiceChip";

import type { PlannerOption } from "../model/planner-form";

interface OptionChipGroupProps {
	type: "radio" | "checkbox";
	name: string;
	labelledBy: string;
	options: PlannerOption[];
	selectedIds: number[];
	onToggle: (id: number) => void;
}

export function OptionChipGroup({ type, name, labelledBy, options, selectedIds, onToggle }: OptionChipGroupProps) {
	const handleChange = (id: number) => () => {
		onToggle(id);
	};

	return (
		<div
			role={type === "radio" ? "radiogroup" : "group"}
			aria-labelledby={labelledBy}
			className="grid grid-cols-2 gap-1.75"
		>
			{options.map((option) => (
				<ChoiceChip
					key={option.id}
					type={type}
					name={name}
					value={String(option.id)}
					label={option.label}
					checked={selectedIds.includes(option.id)}
					onChange={handleChange(option.id)}
				/>
			))}
		</div>
	);
}
