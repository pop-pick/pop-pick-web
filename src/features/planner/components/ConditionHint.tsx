interface ConditionHintProps {
	text: string;
}

export function ConditionHint({ text }: ConditionHintProps) {
	return (
		<p className="text-caption text-text-4">
			<span className="text-primary">*</span> {text}
		</p>
	);
}
