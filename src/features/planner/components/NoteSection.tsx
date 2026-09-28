"use client";

import { type ChangeEvent, useId } from "react";

import { COURSE_NOTE_MAX_LENGTH } from "../model/course-request";

interface NoteSectionProps {
	note: string;
	onChange: (note: string) => void;
}

const NOTE_PLACEHOLDER = "예시) 귀여운 캐릭터 굿즈 구경하는 걸 좋아해요.";

export function NoteSection({ note, onChange }: NoteSectionProps) {
	const titleId = useId();
	const descriptionId = useId();
	const counterId = useId();

	const handleNoteChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
		onChange(event.target.value);
	};

	return (
		<section aria-labelledby={titleId} className="flex flex-col gap-4">
			<div className="flex flex-col gap-2">
				<h2 id={titleId} className="text-b1-14 text-text-2">
					이외의 좋아하는 것
				</h2>
				<p id={descriptionId} className="text-b3-14 whitespace-pre-line text-text-4">
					{"좋아하는 것을 자유롭게 작성해주세요.\nAI가 팝업을 추천할 때 참고해요."}
				</p>
			</div>
			<div className="flex flex-col gap-3">
				<textarea
					aria-labelledby={titleId}
					aria-describedby={`${descriptionId} ${counterId}`}
					value={note}
					maxLength={COURSE_NOTE_MAX_LENGTH}
					placeholder={NOTE_PLACEHOLDER}
					onChange={handleNoteChange}
					rows={2}
					className="h-22 scrollbar-subtle w-full resize-none rounded-2xl border border-transparent bg-bg-2 p-5 text-b3-16 text-text-1 transition-colors placeholder:text-text-4 focus:border-primary focus:outline-hidden"
				/>
				<p id={counterId} className="text-b3-14 text-text-4">
					{`${String(note.length)}/${String(COURSE_NOTE_MAX_LENGTH)}자`}
				</p>
			</div>
		</section>
	);
}
