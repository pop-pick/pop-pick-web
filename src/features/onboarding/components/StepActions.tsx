interface StepActionsProps {
	onSkip: () => void;
}

export function StepActions({ onSkip }: StepActionsProps) {
	return (
		<div className="sticky bottom-0 z-40 mt-auto flex gap-2 rounded-t-3xl bg-bg-1 px-4 pt-4 pb-float-gap shadow-bar">
			<button
				type="button"
				onClick={onSkip}
				className="flex h-13 flex-1 items-center justify-center rounded-xl bg-bg-3 text-h4 text-text-2 focus-ring transition-colors hover:bg-bg-4"
			>
				건너뛰기
			</button>
			<button
				type="submit"
				className="flex h-13 flex-1 items-center justify-center rounded-xl bg-primary text-h4 text-text-w focus-ring transition-colors hover:bg-primary-strong"
			>
				다음
			</button>
		</div>
	);
}
