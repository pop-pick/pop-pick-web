"use client";

import { useReducedMotion } from "motion/react";
import * as m from "motion/react-m";
import { type MouseEvent, useEffect, useId, useRef, useState } from "react";

import { buildProgressPlan, type ProgressPlan } from "../model/generating-progress";
import { GENERATING_STEPS, toStepState } from "../model/generating-steps";
import { GeneratingSpinner } from "./GeneratingSpinner";
import { GeneratingStepItem } from "./GeneratingStepItem";

interface GeneratingViewProps {
	onCancel: () => void;
}

const MS_PER_SECOND = 1000;
const SINGLE_CLICK_DETAIL = 1;
const SHIMMER_ANIMATION = { x: ["-100%", "250%"] };
const SHIMMER_TRANSITION = { duration: 1.4, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.4 } as const;

function toBarAnimation({ keyframes, stepEndsAtMs }: ProgressPlan) {
	const totalMs = stepEndsAtMs.at(-1) ?? 0;

	return {
		animate: { scaleX: keyframes.map((keyframe) => keyframe.ratio) },
		transition: {
			duration: totalMs / MS_PER_SECOND,
			times: keyframes.map((keyframe) => keyframe.atMs / totalMs),
			ease: "easeOut" as const
		}
	};
}

export function GeneratingView({ onCancel }: GeneratingViewProps) {
	const shouldReduceMotion = useReducedMotion() === true;
	const [plan] = useState(() => buildProgressPlan(Math.random));
	const [activeIndex, setActiveIndex] = useState(0);
	const activeStepLabel = GENERATING_STEPS[activeIndex]?.label;
	const barAnimation = toBarAnimation(plan);
	const titleId = useId();
	const titleRef = useRef<HTMLHeadingElement>(null);

	const handleCancelClick = (event: MouseEvent<HTMLButtonElement>) => {
		const isRepeatedClick = event.detail > SINGLE_CLICK_DETAIL;
		if (isRepeatedClick) {
			return;
		}

		onCancel();
	};

	useEffect(() => {
		titleRef.current?.focus();
	}, []);

	useEffect(() => {
		const timers = plan.stepEndsAtMs.slice(0, -1).map((endsAtMs, stepIndex) =>
			window.setTimeout(() => {
				setActiveIndex(stepIndex + 1);
			}, endsAtMs)
		);

		return () => {
			timers.forEach((timer) => {
				window.clearTimeout(timer);
			});
		};
	}, [plan]);

	return (
		<section aria-labelledby={titleId} className="flex flex-1 flex-col">
			<div className="flex flex-col items-center px-5 pt-30.5 text-center">
				<GeneratingSpinner />
				<h1 ref={titleRef} id={titleId} tabIndex={-1} className="mt-11.25 text-h1 text-text-1 outline-none">
					팝업 코스를 만들고 있어요.
				</h1>
				<p className="mt-3 text-b2-14 text-text-4">10초 정도 소요될 수 있어요.</p>
			</div>
			<section aria-label="코스 생성 단계" className="mx-5 mt-17 rounded-2xl bg-bg-2 px-6 pt-7 pb-6">
				<div className="relative h-2 overflow-hidden rounded-full bg-divider-3">
					<m.div
						initial={{ scaleX: 0 }}
						animate={shouldReduceMotion ? { scaleX: activeIndex / GENERATING_STEPS.length } : barAnimation.animate}
						transition={shouldReduceMotion ? { duration: 0 } : barAnimation.transition}
						className="relative h-full origin-left overflow-hidden rounded-full bg-primary"
					>
						{!shouldReduceMotion && (
							<m.span
								aria-hidden
								animate={SHIMMER_ANIMATION}
								transition={SHIMMER_TRANSITION}
								className="absolute inset-y-0 left-0 w-1/3 bg-linear-to-r from-transparent via-bg-1/40 to-transparent"
							/>
						)}
					</m.div>
				</div>
				<ol className="mt-7 flex flex-col gap-5">
					{GENERATING_STEPS.map((step, index) => (
						<GeneratingStepItem key={step.label} label={step.label} state={toStepState(index, activeIndex)} />
					))}
				</ol>
				<p role="status" className="sr-only">
					{`${activeStepLabel} 진행 중`}
				</p>
			</section>
			<div className="sticky bottom-0 mt-auto rounded-t-3xl bg-bg-1 px-4 pt-4 pb-float-gap shadow-bar">
				<button
					type="button"
					onClick={handleCancelClick}
					className="flex h-13 w-full items-center justify-center rounded-xl border border-divider-2 bg-bg-1 text-h4 text-text-3 focus-ring transition-colors hover:bg-bg-2"
				>
					취소하기
				</button>
			</div>
		</section>
	);
}
