import { GENERATING_STEPS } from "./generating-steps";

export interface ProgressKeyframe {
	atMs: number;
	/** 0부터 1까지 */
	ratio: number;
}

export interface ProgressPlan {
	keyframes: ProgressKeyframe[];
	/** 단계마다 끝나는 시각. 마지막 값이 전체 길이다 */
	stepEndsAtMs: number[];
}

const MIN_STEP_MS = 2600;
const STEP_MS_SPREAD = 1400;
const MIN_SEGMENTS = 3;
const SEGMENT_SPREAD = 3;
const PAUSE_CHANCE = 0.35;
const LAST_STEP_HOLD_RATIO = 0.93;
const FINAL_JUMP_MS = 250;

function splitDuration(totalMs: number, weights: number[]) {
	const weightSum = weights.reduce((sum, weight) => sum + weight, 0);
	return weights.map((weight) => (totalMs * weight) / weightSum);
}

/**
 * 서버는 끝났는지만 알려 주므로 진행 막대는 프론트가 그린다. 일정한 속도로 차면 시간을 재는 화면처럼 보여서
 * 단계마다 조각을 나눠 빨리 가다 멈칫하게 하고 마지막 단계는 끝 조금 앞에서 버티다 채운다.
 * `random`은 0 이상 1 미만을 돌려준다
 */
export function buildProgressPlan(random: () => number) {
	const keyframes: ProgressKeyframe[] = [{ atMs: 0, ratio: 0 }];
	const stepEndsAtMs: number[] = [];
	let elapsedMs = 0;

	GENERATING_STEPS.forEach((_, stepIndex) => {
		const isLastStep = stepIndex === GENERATING_STEPS.length - 1;
		const stepStartRatio = stepIndex / GENERATING_STEPS.length;
		const stepEndRatio = isLastStep ? LAST_STEP_HOLD_RATIO : (stepIndex + 1) / GENERATING_STEPS.length;
		const stepMs = MIN_STEP_MS + random() * STEP_MS_SPREAD - (isLastStep ? FINAL_JUMP_MS : 0);
		const segmentCount = MIN_SEGMENTS + Math.floor(random() * SEGMENT_SPREAD);
		const segmentDurations = splitDuration(
			stepMs,
			Array.from({ length: segmentCount }, () => 0.5 + random())
		);
		const advances = Array.from({ length: segmentCount }, (_, index) =>
			index > 0 && random() < PAUSE_CHANCE ? 0 : 0.3 + random()
		);
		const advanceSum = advances.reduce((sum, advance) => sum + advance, 0);
		let ratio = stepStartRatio;

		segmentDurations.forEach((durationMs, index) => {
			elapsedMs += durationMs;
			ratio += ((advances[index] ?? 0) / advanceSum) * (stepEndRatio - stepStartRatio);
			keyframes.push({ atMs: elapsedMs, ratio });
		});

		if (isLastStep) {
			elapsedMs += FINAL_JUMP_MS;
			keyframes.push({ atMs: elapsedMs, ratio: 1 });
		}

		stepEndsAtMs.push(elapsedMs);
	});

	return { keyframes, stepEndsAtMs };
}
