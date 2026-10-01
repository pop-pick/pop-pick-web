import { type ChangeEvent, useId } from "react";

import { formatEnteredLength } from "../model/messages";

const LIVE_ANNOUNCE_REMAINING_LENGTH = 20;

interface FreeTextFieldProps {
	label: string;
	description: string;
	value: string;
	maxLength: number;
	placeholder: string;
	onChange: (value: string) => void;
}

export function FreeTextField({ label, description, value, maxLength, placeholder, onChange }: FreeTextFieldProps) {
	const fieldId = useId();
	const descriptionId = useId();
	const counterId = useId();
	const enteredText = formatEnteredLength(value.length, maxLength);
	const isNearLimit = maxLength - value.length <= LIVE_ANNOUNCE_REMAINING_LENGTH;

	const handleTextChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
		onChange(event.target.value);
	};

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-col gap-2">
				<label htmlFor={fieldId} className="text-b1-14 text-text-2">
					{label}
				</label>
				<p id={descriptionId} className="text-b3-14 whitespace-pre-line text-text-4">
					{description}
				</p>
			</div>
			<div className="flex flex-col gap-3">
				<textarea
					id={fieldId}
					aria-describedby={`${descriptionId} ${counterId}`}
					value={value}
					maxLength={maxLength}
					placeholder={placeholder}
					onChange={handleTextChange}
					rows={2}
					className="scrollbar-subtle w-full resize-none rounded-panel bg-bg-2 p-5 text-b3-16 text-text-1 transition-shadow placeholder:text-text-4 focus:inset-ring focus:inset-ring-primary focus:outline-hidden"
				/>
				<p id={counterId} className="text-left text-b3-14 text-text-4">
					{enteredText}
				</p>
				<p aria-live="polite" className="sr-only">
					{isNearLimit ? enteredText : ""}
				</p>
			</div>
		</div>
	);
}
