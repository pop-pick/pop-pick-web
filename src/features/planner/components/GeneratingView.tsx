"use client";

import { useReducedMotion } from "motion/react";
import * as m from "motion/react-m";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { buildProgressPlan, type ProgressPlan } from "../model/generating-progress";
import { GENERATING_STEPS, toStepState } from "../model/generating-steps";
import { GeneratingStepItem } from "./GeneratingStepItem";

interface GeneratingViewProps {
	editHref: string;
	resultHref: string;
}

const MS_PER_SECOND = 1000;
const FLOAT_ANIMATION = { y: [0, -8, 0] };
const FLOAT_TRANSITION = { duration: 2.4, ease: "easeInOut", repeat: Infinity } as const;
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

/** 조건 입력에서 왔으면 뒤로 가서 기록에 입력 화면이 두 번 쌓이지 않게 한다. Navigation API가 없으면 알 수 없어 주소를 바꾼다 */
function isPreviousEntryPath(pathname: string) {
	const navigation: Navigation | undefined = window.navigation;
	const currentIndex = navigation?.currentEntry?.index ?? -1;
	const previousUrl = currentIndex > 0 ? navigation?.entries()[currentIndex - 1]?.url : undefined;

	return previousUrl !== undefined && previousUrl !== null && new URL(previousUrl).pathname === pathname;
}

export function GeneratingView({ editHref, resultHref }: GeneratingViewProps) {
	const router = useRouter();
	const shouldReduceMotion = useReducedMotion() === true;
	const [plan] = useState(() => buildProgressPlan(Math.random));
	const [activeIndex, setActiveIndex] = useState(0);
	const activeStep = GENERATING_STEPS[activeIndex];
	const barAnimation = toBarAnimation(plan);

	useEffect(() => {
		const timers = plan.stepEndsAtMs.map((endsAtMs, stepIndex) =>
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

	useEffect(() => {
		if (activeStep === undefined) {
			router.replace(resultHref);
		}
	}, [activeStep, resultHref, router]);

	const handleCancel = () => {
		if (isPreviousEntryPath(new URL(editHref, window.location.origin).pathname)) {
			router.back();
			return;
		}

		router.replace(editHref);
	};

	return (
		<main className="flex flex-1 flex-col">
			<div className="flex flex-col items-center px-5 pt-38 text-center">
				<m.div
					aria-hidden
					animate={shouldReduceMotion ? undefined : FLOAT_ANIMATION}
					transition={FLOAT_TRANSITION}
					className="size-29.5 bg-bg-5"
				/>
				<h1 className="mt-8 text-h1 text-text-1">팝업 코스를 만들고 있어요.</h1>
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
					{activeStep === undefined ? "코스를 다 만들었어요" : `${activeStep.label} 진행 중`}
				</p>
			</section>
			<div className="sticky bottom-0 mt-auto rounded-t-3xl bg-bg-1 px-4 pt-4 pb-float-gap shadow-bar">
				<button
					type="button"
					onClick={handleCancel}
					className="flex h-13 w-full items-center justify-center rounded-xl border border-divider-2 bg-bg-1 text-h4 text-text-3 focus-ring transition-colors hover:bg-bg-2"
				>
					취소하기
				</button>
			</div>
		</main>
	);
}
