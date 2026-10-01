interface ChoiceChipProps {
	type: "radio" | "checkbox";
	name: string;
	value: string;
	label: string;
	checked: boolean;
	onChange: () => void;
}

export function ChoiceChip({ type, name, value, label, checked, onChange }: ChoiceChipProps) {
	return (
		<label
			data-label={label}
			className="label-width-stable min-h-12 cursor-pointer rounded-full border border-divider-2 bg-bg-2 px-2.5 py-2 text-center text-b2-16 wrap-anywhere text-text-3 transition-colors hover:bg-bg-3 has-checked:border-primary has-checked:bg-primary-subtle has-checked:text-b1-16 has-checked:text-primary has-checked:hover:bg-primary-subtle has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary"
		>
			<input type={type} name={name} value={value} checked={checked} onChange={onChange} className="sr-only" />
			<span>{label}</span>
		</label>
	);
}
