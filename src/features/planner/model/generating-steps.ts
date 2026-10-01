export const GENERATING_STEPS = [
	{ label: "팝업 선택하기" },
	{ label: "동선 계산하기" },
	{ label: "시간표 맞추기" }
] as const;

export type GeneratingStepState = "done" | "active" | "pending";

export const GENERATING_STEP_STATE_LABELS: Record<GeneratingStepState, string> = {
	done: "완료",
	active: "진행중",
	pending: "대기"
};

export function toStepState(stepIndex: number, activeIndex: number) {
	if (stepIndex < activeIndex) {
		return "done";
	}

	return stepIndex === activeIndex ? "active" : "pending";
}
