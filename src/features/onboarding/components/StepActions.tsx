interface StepActionsProps {
	onSkip: () => void;
}

export function StepActions({ onSkip }: StepActionsProps) {
	return (
		<div className="sticky bottom-0 z-40 mt-auto flex flex-col gap-2.5 rounded-t-3xl bg-bg-1 px-4 pt-4 pb-float-gap shadow-bar">
			<button
				type="submit"
				className="flex h-13 w-full items-center justify-center rounded-xl bg-primary text-h4 text-text-w focus-ring transition-colors hover:bg-primary-strong"
			>
				다음
			</button>
			<button
				type="button"
				onClick={onSkip}
				className="flex h-13 w-full items-center justify-center rounded-xl border border-primary bg-bg-1 text-h4 text-primary focus-ring transition-colors hover:bg-primary-subtle"
			>
				건너뛰기
			</button>
		</div>
	);
}
