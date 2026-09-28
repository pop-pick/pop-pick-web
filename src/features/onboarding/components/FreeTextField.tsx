"use client";

import { type ChangeEvent, useId } from "react";

import { formatRemainingLength } from "../model/messages";

const LIVE_ANNOUNCE_REMAINING_LENGTH = 20;

interface FreeTextFieldProps {
	label: string;
	value: string;
	maxLength: number;
	placeholder: string;
	onChange: (value: string) => void;
}

export function FreeTextField({ label, value, maxLength, placeholder, onChange }: FreeTextFieldProps) {
	const fieldId = useId();
	const counterId = useId();
	const remainingText = formatRemainingLength(value.length, maxLength);
	const isNearLimit = maxLength - value.length <= LIVE_ANNOUNCE_REMAINING_LENGTH;

	const handleTextChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
		onChange(event.target.value);
	};

	return (
		<div className="flex flex-col gap-4">
			<label htmlFor={fieldId} className="text-b1-14 text-text-2">
				{label}
				<span className="ml-1 text-caption text-text-4">(선택)</span>
			</label>
			<div className="flex flex-col gap-3">
				<textarea
					id={fieldId}
					aria-describedby={counterId}
					value={value}
					maxLength={maxLength}
					placeholder={placeholder}
					onChange={handleTextChange}
					rows={3}
					className="scrollbar-subtle w-full resize-none rounded-2xl border border-transparent bg-bg-2 p-5 text-b3-16 text-text-1 transition-colors placeholder:text-text-4 focus:border-primary focus:outline-hidden"
				/>
				<p id={counterId} className="text-right text-b3-14 text-text-4">
					{remainingText}
				</p>
				<p aria-live="polite" className="sr-only">
					{isNearLimit ? remainingText : ""}
				</p>
			</div>
		</div>
	);
}
